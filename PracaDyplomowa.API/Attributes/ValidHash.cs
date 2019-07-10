using Microsoft.AspNet.Identity;
using PracaDyplomowa.API.Controllers;
using PracaDyplomowa.API.DAL;
using PracaDyplomowa.API.Models.Advertisments;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace PracaDyplomowa.API.Attributes
{
    public class HasCompoleteInfo : ActionFilterAttribute
    {
        public override async Task OnActionExecutingAsync(HttpActionContext actionContext, CancellationToken cancellationToken)
        {
            var controller = actionContext.ControllerContext.Controller as ApplicationController;
            ApplicationUser applicationUser = await controller.AppUserManager.FindByIdAsync(controller.User.Identity.GetUserId());

            if (new[] { applicationUser.Name, applicationUser.Surname, applicationUser.PhoneNumber }.Any(x => x is null))
            {
                actionContext.Response = new HttpResponseMessage(System.Net.HttpStatusCode.Forbidden)
                {
                    Content = new StringContent("Aby móc dodawać nowe ogłoszenia przejdź do strony zarządzania kontem w celu uzupełnienia informacji podstawowych")
                };
            }
        }
    }

    public class HashVerifyAttribute : ActionFilterAttribute
    {
        protected Task<Guid> CreateMd5Hash(string value, CancellationToken cancellationToken)
        {
            var builder = new StringBuilder();
            return Task.Run(() =>
             {
                 using (var md5 = MD5.Create())
                 {
                     foreach (var hex in md5.ComputeHash(Encoding.ASCII.GetBytes(value)).Select(@byte => @byte.ToString("x2")))
                     {
                         if (cancellationToken.IsCancellationRequested) break;
                         builder.Append(hex);
                     }
                 }
                 return new Guid(builder.ToString());
             }, cancellationToken);
        }
        public override async Task OnActionExecutingAsync(HttpActionContext actionContext, CancellationToken cancellationToken)
        {
            var controller = actionContext.ControllerContext.Controller as ApplicationController;
            var (id, advertisment) = ( (Guid) actionContext.ActionArguments["id"], (PutAdvertisment) actionContext.ActionArguments["_advertisment"]);
            var userId = controller.User.Identity.GetUserId();
            Guid hash = await CreateMd5Hash($"{userId}{advertisment.CreationTime}", cancellationToken);
            if (id != hash) actionContext.Response = new HttpResponseMessage(System.Net.HttpStatusCode.Conflict);
        }
    }

    public class ExpirationAttribute : ActionFilterAttribute
    {
        private readonly TimeSpan ExpirationTime;
        public ExpirationAttribute(int minutes = 0, int seconds = 0)
        {
            ExpirationTime = new TimeSpan(0, minutes, seconds);
        }
        public override async Task OnActionExecutingAsync(HttpActionContext actionContext, CancellationToken cancellationToken)
        {
            var controller = actionContext.ControllerContext.Controller as ApplicationController;
            var (id, advertisment) = ((Guid) actionContext.ActionArguments["id"], (PutAdvertisment) actionContext.ActionArguments["_advertisment"]);
            long? orginalCreationTime = (await controller.Db.Advertisments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken))?.CreationTime;
            if (orginalCreationTime is null)
            {
                var serverTime = DateTimeOffset.UtcNow;
                var clientTime = DateTimeOffset.FromUnixTimeMilliseconds(advertisment.CreationTime ?? 0);
                bool condition = serverTime >= clientTime && serverTime - clientTime < ExpirationTime;
                if (!condition) actionContext.Response = new HttpResponseMessage(System.Net.HttpStatusCode.RequestTimeout);
            }
            else if (orginalCreationTime != advertisment.CreationTime)
            {
                actionContext.Response = new HttpResponseMessage(System.Net.HttpStatusCode.Conflict);
            }
        }
    }

    public class ExtensionsAttribute : ValidationAttribute
    {
        private readonly Regex regex;
        public ExtensionsAttribute(string[] extensions)
        {
            regex = new Regex($@"^data:image\/({string.Join("|", extensions)})");
        }
        public override bool IsValid(object value) => !(value as IEnumerable<Image>).Where(x => x.Name.StartsWith("http:")).Any(x => !regex.IsMatch(x.Name));
    }

}
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using PracaDyplomowa.API.Controllers;
using PracaDyplomowa.API.DAL;
using PracaDyplomowa.API.Infrastructure;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace PracaDyplomowa.API.Models.Account
{
    public class UserInfo
    {
        public string Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Surname { get; set; }
        [Phone, Required]
        public string Phone { get; set; }
        public string ProfileImage { get; set; }       
    }

    public static class HelperExtension
    {
        private static ApplicationUserManager UserManager => HttpContext.Current.GetOwinContext().Get<ApplicationUserManager>();
        public static async Task<ApplicationUser> AsApplicationUserAsync(this UserInfo userInfo, IPrincipal principal)
        {
            ApplicationUser user = await UserManager.FindByNameAsync(principal.Identity.Name);
            user.Name = userInfo.Name;
            user.Surname = userInfo.Surname;
            user.PhoneNumber = userInfo.Phone;
            return user;
        }
        public static async Task<UserInfo> AsUserInfoAsync(this IPrincipal principal)
        {
            ApplicationUser user = await UserManager.FindByNameAsync(principal.Identity.Name);
            string imagePath = HostingEnvironment.MapPath(Path.Combine("~/ProfileImages", principal.Identity.GetUserId()));
            async Task<string> readFile()
            {
                using (FileStream stream = File.Open(imagePath, FileMode.Open))
                using (var streamReader = new StreamReader(stream))
                {
                    return await streamReader.ReadToEndAsync();
                }
            }
            return new UserInfo
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Phone = user.PhoneNumber,
                ProfileImage = File.Exists(imagePath) ? await readFile() : null,
            };
        }
    }

    public class Email
    {
        [Required, EmailAddress]
        public string Value { get; set; }
    }

    public class ConfirmEmailForm
    {
        [RegularExpression(pattern: @"^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$", 
                           ErrorMessage = "Niepoprawny format identyfikatora")]
        public string UserId { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
        [Required(ErrorMessage = "{0} jest wymagany w celu aktywacji konta")]
        public string Token { get; set; }
    }
}
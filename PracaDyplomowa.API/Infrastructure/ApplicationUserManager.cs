using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using PracaDyplomowa.API.DAL;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace PracaDyplomowa.API.Infrastructure
{
    public class ApplicationUserManager : UserManager<ApplicationUser>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser> store) : base(store) { }
        public Task SendEmailAsync(string userId, string subject, object email)
        {
            Type type = email.GetType();
            string file = File.ReadAllText(HostingEnvironment.MapPath(Path.Combine(@"~\Emails\Html", $"{type.Name}.html")));
            foreach (var property in type.GetProperties())
            {
                var regex = new Regex(pattern: "{{\\s*" + property.Name + "\\s*}}", options: RegexOptions.IgnorePatternWhitespace);
                file = regex.Replace(file, property.GetValue(email).ToString());
            }
            return base.SendEmailAsync(userId, subject, file);
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            var dataProtectionProvider = options.DataProtectionProvider;
            var appDbContext = context.Get<DatabaseContext>();
            var appUserManager = new ApplicationUserManager(new UserStore<ApplicationUser>(appDbContext));
            appUserManager.EmailService = new Services.EmailService();
            
            //appUserManager.PasswordValidator = new PasswordValidator
            //{
            //    RequiredLength = 6,
            //    RequireNonLetterOrDigit = true,
            //    RequireDigit = false,
            //    RequireLowercase = true,
            //    RequireUppercase = true
            //};
            if (dataProtectionProvider != null)
            {
               
                appUserManager.UserTokenProvider = new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"))
                {
                    //Code for email confirmation and reset password life time
                    TokenLifespan = TimeSpan.FromHours(6)
                };
            }
            return appUserManager;
        }
    }
}

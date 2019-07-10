using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security.OAuth;
using PracaDyplomowa.API.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace PracaDyplomowa.API.Providers
{
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            context.Validated();
            return Task.FromResult<object>(null);
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });
            IdentityUser user = await context.OwinContext.Get<ApplicationUserManager>().FindAsync(context.UserName, context.Password);

            if (user?.EmailConfirmed == true)
            {
                var identity = new ClaimsIdentity(context.Options.AuthenticationType);
                identity.AddClaim(new Claim("sub", context.UserName));
                identity.AddClaim(new Claim(ClaimTypes.Name, user.UserName));
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));
                identity.AddClaim(new Claim("role", "user"));
                context.Validated(identity);
            }
            else 
            {
                var (error, description) = user is null ? ("invalid_grant", "The user name or password is incorrect.") :
                                                          ("email_confirmation", "Przejdź do swojej poczty. Wysłaliśmy email w celu aktywacji konta");
                context.SetError(error, description);
            }
        }
    }
}
using Microsoft.AspNet.Identity;
using PracaDyplomowa.API.DAL;
using PracaDyplomowa.API.Models;
using PracaDyplomowa.API.Models.Account;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Http.ModelBinding;

namespace PracaDyplomowa.API.Controllers
{

    public class ChangePassword
    {
        [Required, Display(Name = "Stare hasło")]
        public string CurrentPassword { get; set; }

        [Required, Display(Name = "Nowe hasło")]
        public string NewPassword { get; set; }

        [Required, Compare(nameof(NewPassword)), Display(Name = "Powtórz hasło")]
        public string NewPasswordConfirm { get; set; }
    }


    [RoutePrefix("api/account"), Authorize]
    public class AccountsController : ApplicationController
    {

        [Route("")]
        public async Task<IHttpActionResult> PatchAsync(UserInfo userInfo)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updateUser = await AppUserManager.UpdateAsync(await userInfo.AsApplicationUserAsync(User));
            string profileImagesPath = HostingEnvironment.MapPath(Path.Combine("~/ProfileImages", User.Identity.GetUserId()));
            if (string.IsNullOrEmpty(userInfo.ProfileImage)) File.Delete(profileImagesPath);
            else
            {
                using (var fileStream = new FileStream(profileImagesPath, FileMode.Create))
                using (var streamWriter = new StreamWriter(fileStream))
                {
                    await streamWriter.WriteAsync(userInfo.ProfileImage);
                }
            }
            return Ok("Twoje dane zostały zmionione");
        }

        [Route("", Name = "UserData")]
        public async Task<IHttpActionResult> Get() => Ok(await User.AsUserInfoAsync());

        [HttpPost, AllowAnonymous, Route("")]
        public async Task<IHttpActionResult> PostAsync (UserModel userModel)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            ApplicationUser user = (ApplicationUser) userModel;
            IdentityResult addUserResult = await AppUserManager.CreateAsync(user, userModel.Password);
            if (!addUserResult.Succeeded)
            {
                ModelState.AddModelErrorRange(addUserResult.Errors);
                return BadRequest(ModelState);
            }
            string token = await AppUserManager.GenerateEmailConfirmationTokenAsync(user.Id);
            const string format = "http://127.0.0.1:5500/#!/konto/activate/token={0}&user={1}";
            AppUserManager.SendEmailAsync(user.Id, "Activate", new Emails.Register() { Address = string.Format(format, token, user.Id) });
            return Created(Url.Link("UserData", null), user);
        }

        [HttpPost, AllowAnonymous, Route("activate")]
        public async Task<IHttpActionResult> ConfirmEmailAsync(ConfirmEmailForm form)
        {
            return
                !ModelState.IsValid ? BadRequest(ModelState) : !await verifyUserAuthData(form.UserId, form.UserName, form.Password)
                                    ? BadRequest("Nazwa użytkownika, identyfikator lub hasło są niepoprawne") : !await verifyUserTokenAsync(form.UserId, form.Token)
                                    ? BadRequest("podany token jest niepoprawny") : await activateAccountAsync(form.UserId, form.Token);


            async Task<bool> verifyUserAuthData(string userId, string userName, string password) => await AppUserManager.FindAsync(userName, password) is ApplicationUser user ? user.Id == userId.ToString() : false;

            Task<bool> verifyUserTokenAsync(string userId, string token) => AppUserManager.VerifyUserTokenAsync(userId, "Confirmation", token);

            async Task<IHttpActionResult> activateAccountAsync(string userId, string token){
                IdentityResult identityResult = await AppUserManager.ConfirmEmailAsync(userId, token);
                return identityResult.Succeeded ? Ok() : (IHttpActionResult) InternalServerError(new Exception("Nieoczekiwany błąd serwera"));
            }
        }

        [HttpPatch, Route("password")]
        public async Task<IHttpActionResult> ChangePasswordAsync(ChangePassword changePassword)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await AppUserManager.ChangePasswordAsync(User.Identity.GetUserId(), changePassword.CurrentPassword, changePassword.NewPassword);
            if(!result.Succeeded)
            {
                ModelState.AddModelErrorRange(result.Errors);
                return BadRequest(ModelState);
            }
            return Ok("Hasło zostało zmienione");
        }
    }
}

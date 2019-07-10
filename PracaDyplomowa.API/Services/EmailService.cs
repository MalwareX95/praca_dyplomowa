using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;


namespace PracaDyplomowa.API.Services
{
    public class EmailService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            var mail = new MailMessage
            {
                From = new MailAddress(ConfigurationManager.AppSettings["EmailAddress"]),
                IsBodyHtml = true,
                Subject = message.Subject,
                Body = message.Body,
            };
            mail.To.Add(message.Destination);
            return new SmtpClient().SendMailAsync(mail);
        }
    }
}
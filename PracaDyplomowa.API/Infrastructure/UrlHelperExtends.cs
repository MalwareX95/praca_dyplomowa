using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http.Routing;

namespace PracaDyplomowa.API.Infrastructure
{
    public static class UrlHelperExtends 
    {
        public static string ImageAdvertisment(this UrlHelper @this, string name)
        {
            return @this.Content(Path.Combine("~/", ConfigurationManager.AppSettings["Images"], name));
        }
    }
}
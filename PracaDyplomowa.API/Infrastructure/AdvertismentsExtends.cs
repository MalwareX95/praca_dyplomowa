using PracaDyplomowa.API.DAL;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace PracaDyplomowa.API.Infrastructure
{
    public static class AdvertismentsExtends
    {
        public static Task<string> GetUserImageAsync(this Advertisment @this)
        {
            var folder = HostingEnvironment.MapPath("~/ProfileImages");
            var path = Path.Combine(folder, @this.UserId);
            return File.Exists(path) ? readFileAsync() : Task.FromResult<string>(null);
            
            async Task<string> readFileAsync()
            {
                using (var stream = new StreamReader(File.OpenRead(path)))
                {
                    return await stream.ReadToEndAsync();
                }
            }
        }
    }
}
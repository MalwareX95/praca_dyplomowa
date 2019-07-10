using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using PracaDyplomowa.API.Attributes;
using PracaDyplomowa.API.Controllers;
using PracaDyplomowa.API.DAL;

namespace PracaDyplomowa.API.Models.Advertisments
{
    public class PutAdvertisment : MiejscModel
    {
        public byte? Rooms { get; set; }
        public int? Price { get; set; }
        public double? Area { get; set; }
        public short? ConstructionYear { get; set; }
        public string Description { get; set; }
        [Required]
        public long? CreationTime { get; set; }
        [Required]
        public byte Level { get; set; }
        public byte LevelFrom { get; set; }
        public int? Deposit { get; set; }
        public List<ExtraInfo> ExtraInfo { get; set; }
        public List<Media> Media { get; set; }
        public Kind Kind { get; set; }
        public Heating Heating { get; set; }
        public string AvialableSince { get; set; }
        //[Extensions(new[] { "jpg", "png", "jpeg" }, ErrorMessage = "Przynajmniej jeden z plików posiada niedozwolony format")]
        public List<Image> Images { get; set; }
        public string UserId { get; set; }
        public Task SaveNewImagesAsync()
        {
            return Task.Run(() =>
            {
                var regex = new Regex(@"^data:image\/(?<extension>\w+);base64,(?<content>.+)");
                var query = from image in Images
                            let match = regex.Match(image.Name)
                            where match.Success
                            select (image, extensions: match.Groups["extension"], @bytes: Convert.FromBase64String(match.Groups["content"].Value));
                foreach (var (image, extension, @bytes) in query)
                {
                    image.Name = $"{image.Id = Guid.NewGuid()}.{extension}";
                    string path = HostingEnvironment.MapPath($"~/Images/{image.Name}");
                    using (var file = new FileStream(path, FileMode.Create))
                    {
                        file.Write(@bytes, 0, @bytes.Length);
                        file.Flush();
                    }
                }
            });
        }
    }
}
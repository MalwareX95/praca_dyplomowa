using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace PracaDyplomowa.API.DAL
{
    public class Initializer : DropCreateDatabaseIfModelChanges<DatabaseContext>
    {
        public List<Image> MyProperty
        {
            get
            {
                return Enumerable.Range(0, 5).OrderBy(x => Guid.NewGuid()).Select(x => new DAL.Image
                {
                    Name = $"picture{x}.jpg"
                }).ToList();
            }
        }

        protected override void Seed(DatabaseContext context)
        {
            Migrations.Configuration.InitDatabase(context);
        }
    }
}
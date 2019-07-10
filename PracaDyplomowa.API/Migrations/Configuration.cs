namespace PracaDyplomowa.API.Migrations
{
    using PracaDyplomowa.API.DAL;
    using PracaDyplomowa.API.Infrastructure;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using System.Web.Http.Routing;

    internal sealed class Configuration : DbMigrationsConfiguration<PracaDyplomowa.API.DAL.DatabaseContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = true;
        }

        public static List<Image> MyProperty
        {
            get
            {
                return Enumerable.Range(0, 5).OrderBy(x => Guid.NewGuid()).Select(x => new DAL.Image
                {
                    Name = $"picture{x}.jpg",
                    Id = Guid.NewGuid()
                }).ToList();
            }
        }

        public static void InitDatabase(PracaDyplomowa.API.DAL.DatabaseContext context)
        {

            var media = new[] { "internet", "gaz", "telefon", "telewizja kablowaaaaaksaas" }.Select((name, index) => new Media { Id = (byte)(index + 1), Name = name });

            var kinds = new[]
            {
                new Kind
                {
                    Id = 0,
                    Name = "Kawalerka"
                },
                new Kind
                {
                    Id = 1,
                    Name = "Mieszkanie"
                },
                new Kind
                {
                    Id = 2,
                    Name = "Pokój"
                },
                new Kind
                {
                    Id = 3,
                    Name = "Apartament"
                }
            };

            var heating = new []
            {
                new Heating{Id = 0, Name = "miejskie"},
                new Heating{Id = 1, Name = "gazowe"},
                new Heating{Id = 2, Name = "piece kaflowe"},
                new Heating{Id = 3, Name = "kot³ownia"},
                new Heating{Id = 4, Name = "inne"}
            };

            var extraInfo = new[] { "balkon",
                                    "pom. u¿ytkowe",
                                    "gara¿/miejsce parkingowe",
                                    "piwnica",
                                    "ogródek",
                                    "taras",
                                    "winda",
                                    "dwupoziomowe",
                                    "oddzielna kuchnia",
                                    "klimatyzacja",
                                    "tylko dla niepal¹cych" }.
                                    Select((name, index) => new ExtraInfo { Id = (byte) (index + 1), Name = name });

            context.Heating.AddOrUpdate(heating);
            context.Medias.AddOrUpdate(media.ToArray());
            context.ExtraInfo.AddOrUpdate(extraInfo.ToArray());
            context.Kinds.AddOrUpdate(kinds);
            context.SaveChanges();
        }

        protected override void Seed(PracaDyplomowa.API.DAL.DatabaseContext context)
        {
            InitDatabase(context);
        }
    }
}

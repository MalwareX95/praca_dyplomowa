using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PracaDyplomowa.API.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;
using System.Web.Http.Routing;

namespace PracaDyplomowa.API.DAL
{
    public interface IUserBasic
    {
        string Name { get; set; }
        string Surname { get; set; }
        string PhoneNumber { get;}
    }

    public class ApplicationUser : IdentityUser, IUserBasic
    {
        public string  Name { get; set; }
        public string  Surname { get; set; }
        [JsonIgnore]
        public virtual ICollection<Advertisment> Advertisments { get; set; }

        //public  UserImage => Path.Combine(ConfigurationManager.AppSettings["ProfileImages"], Id);
    }

    public class DatabaseContext : IdentityDbContext<ApplicationUser>
    {
        public DatabaseContext() : base(nameOrConnectionString: "PracaDyplomowa",
                                        throwIfV1Schema: false) { }
        public virtual DbSet<Advertisment> Advertisments { get; set; }
        public virtual DbSet<Media> Medias { get; set; }
        public virtual DbSet<Kind> Kinds { get; set; }
        public virtual DbSet<Heating> Heating { get; set; }
        public virtual DbSet<ExtraInfo> ExtraInfo { get; set; }
        public virtual DbSet<Image> Images { get; set; }
        public virtual DbSet<Equipment> Equipment { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            modelBuilder.Entity<Advertisment>().
                                HasKey(advert => advert.Id).
                                HasMany(advert => advert.Images).
                                WithOptional(image => image.Advertisment).
                                HasForeignKey(image => image.AdvertismentId).
                                WillCascadeOnDelete(true);

            modelBuilder.Entity<Advertisment>().
                                HasRequired(advert => advert.Kind).
                                WithMany(kind => kind.Advertisments).
                                Map(m => m.MapKey("Kind.Id"));

            modelBuilder.Entity<ApplicationUser>().
                                HasMany(x => x.Advertisments).
                                WithOptional(ad => ad.User).
                                HasForeignKey(ad => ad.UserId);

            modelBuilder.Entity<Image>().
                         HasKey(image => image.Id).
                         Property(image => image.Id).
                         HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            modelBuilder.Entity<Image>()
                        .Property(image => image.AdvertismentId)
                        .HasColumnName("Advertisment.Id");

            modelBuilder.Entity<Media>().
                         HasKey(x => x.Id).
                         Property(x => x.Id).
                         HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Heating>().
                                HasKey(x => x.Id).
                                Property(x => x.Id).
                                HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            modelBuilder.Entity<Advertisment>().
                         HasOptional(a => a.Heating).
                         WithMany(h => h.Advertisments).
                         Map(m => m.MapKey("Heating.Id"));
                         
            modelBuilder.Entity<ExtraInfo>().
                         HasKey(x => x.Id).
                         Property(x => x.Id).
                         HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);
        }
        public static DatabaseContext Create() => new DatabaseContext();
    }

    #region commented
    //modelBuilder.Entity<Heating>().
    //                    HasKey(x => x.Id).
    //                    HasMany(h => h.Advertisments).
    //                    WithOptional(a => a.Heating);

    //modelBuilder.Entity<ExtraInfo>().
    //                    HasKey(x => x.Id).
    //                    HasMany(h => h.Advertisments).
    //                    WithMany(a => a.ExtraInfo);

    //modelBuilder.Entity<Media>().
    //                    HasKey(x => x.Id).
    //                    HasMany(m => m.Advertisments).
    //                    WithMany(a => a.Media);

    //modelBuilder.Entity<ApplicationUser>().
    //                    HasMany(x => x.Advertisments).
    //                    WithOptional(a => a.User).Map(m => m.MapKey("User.Id"));
    #endregion


    class UserBasicCoverter : JsonConverter<ApplicationUser>
    {
        public override ApplicationUser ReadJson(JsonReader reader, Type objectType, ApplicationUser existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            return existingValue;
        }

        public override void WriteJson(JsonWriter writer, ApplicationUser value, JsonSerializer serializer)
        {
            JToken.FromObject(new {surname = value.Surname, name = value.Name, phoneNumber = value.PhoneNumber }).WriteTo(writer);
        }
    }

    public class Advertisment
    {
        public Guid Id { get; set; }
        [JsonIgnore]
        public int? GmiID { get; set;}
        [JsonIgnore]
        public int? SYM { get; set; }
        [JsonIgnore]
        public int PowID { get; set; }
        [JsonIgnore]
        public int WojId { get; set; }
        public object City { get; set; }
        [JsonConverter(typeof(UserBasicCoverter))]
        public virtual ApplicationUser User { get; set; }
        [JsonIgnore]
        public string UserId { get; set; }
        public virtual ICollection<Image> Images { get; set; }
        public virtual ICollection<Media> Media { get; set; }
        public virtual ICollection<ExtraInfo> ExtraInfo { get; set; }
        public virtual Heating Heating { get; set; }
        public short? ConstructionYear { get; set; }
        public int? Deposit { get; set; }
        public long CreationTime { get; set; }
        public byte Level { get; set; }
        public byte LevelFrom { get; set; }
        public byte Rooms { get; set; }
        public string AvialableSince { get; set; }
        public double Area { get; set; }
        public virtual Kind Kind { get; set; }
        public int Price { get; set; }
        public string Description { get; set; }
    }

    public class Media
    {
        public byte Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public virtual ICollection<Advertisment> Advertisments { get; set; }
    }

    public class Kind
    {
        public byte Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public ICollection<Advertisment> Advertisments { get; set; }
    }

    public class Heating
    {
        public byte Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public virtual ICollection<Advertisment> Advertisments { get; set; }
    }

    public class ExtraInfo
    {
        public byte Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public virtual ICollection<Advertisment> Advertisments { get; set; }
    }

    public class Image
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public Guid? AdvertismentId { get; set; }
        [JsonIgnore]
        public Advertisment Advertisment { get; set; }
    }

    public class Equipment
    {
        [Key]
        [JsonIgnore]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public byte Id { get; set; }
        public string Name { get; set; }
        //public ICollection<Advertisment> Advertisments { get; set; }
    }

    //public interface IName
    //{
    //    string Nazwa { get; }
    //}

}

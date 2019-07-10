using Microsoft.AspNet.Identity.Owin;
using Newtonsoft.Json;
using PracaDyplomowa.API.DAL;
using PracaDyplomowa.API.Infrastructure;
using PracaDyplomowa.API.Models.Advertisments;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.Results;

namespace PracaDyplomowa.API.Controllers
{
    public class Base64MediaFormatter : MediaTypeFormatter
    {
        public Base64MediaFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
        }
        public override bool CanReadType(Type type)
        {
            throw new NotImplementedException();
        }

        public override bool CanWriteType(Type type)
        {

            return true;
        }
        public override async Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, TransportContext transportContext)
        {
            var fileInfo = value as FileInfo;
            string extension = fileInfo.Extension.Remove(0, 1);
            using (var fileStream = fileInfo.OpenRead())
            {
                var rawImage = new byte[fileStream.Length];
                await fileStream.ReadAsync(rawImage, 0, rawImage.Length);
                new StreamWriter(writeStream).Write($"data:image/{extension};base64,{Convert.ToBase64String(rawImage)}");
            }
            content.Headers.ContentType = new MediaTypeHeaderValue($"image/{extension}");
            content.Headers.ContentEncoding.Add("base64");
        }
    }

    public class ApplicationController : ApiController
    {
        private ApplicationUserManager _AppUserManager = null;
        public ApplicationUserManager AppUserManager
        {
            get
            {
                return _AppUserManager ?? (_AppUserManager = Request.GetOwinContext().GetUserManager<ApplicationUserManager>());
            }
        }
        protected new JsonResult<T> Json<T>(T content)
        {
            return base.Json(content, GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings);
        }
        private Lazy<DatabaseContext> _Db = new Lazy<DatabaseContext>(() => new DatabaseContext(), isThreadSafe: true);
        //private DatabaseContext _Db;
        public DatabaseContext Db => _Db.Value;
        //public object Repo<T>(Advertisment updated, Func<IEnumerable<T>> func) where T: class
        //{
        //    var old = Db.
        //}
        public Repository<DatabaseContext> Repository = new Repository<DatabaseContext>();
    }

    public static class ModelStateDictionaryExtends
    {
        public static void AddModelErrorRange(this System.Web.Http.ModelBinding.ModelStateDictionary @this, IEnumerable<string> exceptions)
        {
            foreach (var exception in exceptions)
            {
                @this.AddModelError("", exception);
            }
        }

    }
}


public interface IRepository<T>
{
    Task AddAsync(dynamic id, dynamic values);
    Task UpdateAsync(T entity, dynamic values);
    Task<T> FindAsync(object id);
}

public class Repository<TDbContext> : IRepository<Advertisment> where TDbContext : DbContext, new()
{
    readonly TDbContext DbContext = new TDbContext();

    protected void AttachCollectionItems(dynamic values)
    {
        foreach (IEnumerable<object> collection in new[] { values.Media, values.ExtraInfo })
        {
            DbSet dbSet = DbContext.Set(Enumerable.First(collection.GetType().GenericTypeArguments));
            foreach (var item in collection) dbSet.Attach(item);
        }

    }

    public Task AddAsync(dynamic id, dynamic values)
    {
        AttachCollectionItems(values);
        var advert = new Advertisment()
        {
            Id = id,
            Heating = DbContext.Set<Heating>().Attach(values.Heating),
            Kind = DbContext.Set<Kind>().Attach(values.Kind),
            Images = values.Images,
            Media = values.Media,
            ExtraInfo = values.ExtraInfo,
        };
        var entry = DbContext.Entry(advert);
        entry.State = EntityState.Added;
        entry.CurrentValues.SetValues(values);
        return DbContext.SaveChangesAsync();
    }
    private void UpdateRelation<TEntity, T, TJoin>(TEntity entity, Func<TEntity, ICollection<T>> oldValues, IEnumerable<T> newValues, Func<T, TJoin> joinCondition)
    {
        var _oldValues = oldValues(entity);
        var union = (from oldItem in _oldValues
                     join newItem in newValues on
                     joinCondition(oldItem) equals joinCondition(newItem)
                     select new { oldItem, newItem }).ToList();
        _oldValues.Except(union.Select(x => x.oldItem)).ToList().ForEach(x => _oldValues.Remove(x));
        newValues.Except(union.Select(x => x.newItem)).ToList().ForEach(x => _oldValues.Add(x));
    }

    public Task UpdateAsync(Advertisment entity, dynamic values)
    {
        AttachCollectionItems(values);
        entity.Kind = DbContext.Set<Kind>().Attach(values.Kind);
        entity.Heating = DbContext.Set<Heating>().Attach(values.Heating);
        DbContext.Entry(entity).CurrentValues.SetValues(values);
        UpdateRelation(entity, old => old.Media,  (IEnumerable<Media>) values.Media, media => media.Id);
        UpdateRelation(entity, old => old.Images, (IEnumerable<Image>) values.Images, image => image.Id);
        UpdateRelation(entity, old => old.ExtraInfo, (IEnumerable<ExtraInfo>) values.ExtraInfo, extraInfo => extraInfo.Id);
        return DbContext.SaveChangesAsync();
    }

    public Task<Advertisment> FindAsync(object id)
    {
        return DbContext.Set<Advertisment>().FindAsync(id);
    }
}
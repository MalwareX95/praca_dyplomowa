using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using PracaDyplomowa.API.Infrastructure;
using System.Web.Http.Routing;
using Newtonsoft.Json.Linq;
using System.Threading;
using System.IO;
using System.Web.Hosting;
using System.Text;
using System.Threading.Tasks;
using PracaDyplomowa.API.DAL;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using PracaDyplomowa.API.Attributes;
using Microsoft.AspNet.Identity;
using System.Dynamic;

namespace PracaDyplomowa.API.Controllers
{
    [RoutePrefix("api/cards")]
    public class AdvertisementsController : ApplicationController
    {
        private readonly TERYT TerytDb = new DAL.TERYT();

        [HttpGet, Route("gmina")]
        public IEnumerable<Advertisment> GetAllAsync([FromUri] MiejscModel miejscModel)
        {
            var queries = new Dictionary<Type, ParallelQuery<(Advertisment, Miejsc, Gmi, Pow, Woj)>>
            {
                [typeof(MiejscModel)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                        where advert.SYM == miejscModel.SYM
                                        join miejsc in TerytDb.Miejsc.AsNoTracking().AsParallel()
                                        on advert.SYM equals miejsc.SYM
                                        select TupleFrom(advert, miejsc.Gmi, miejsc: miejsc),

                [typeof(IMiejsc)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                    join miejsc in TerytDb.Miejsc.Include(x => x.Gmi.Pow.Woj).AsNoTracking().AsParallel()
                                    on advert.SYM equals miejsc.SYM
                                    let gmina = miejsc.Gmi
                                    let pow = gmina.Pow
                                    let woj = pow.Woj
                                    where miejsc.Nazwa.ToLower() == miejscModel.Miejsc.ToLower() &&
                                          gmina.Name.ToLower() == miejscModel.Gmin.ToLower() &&
                                          pow.Nazwa.ToLower() == miejscModel.Pow.ToLower() &&
                                          woj.Nazwa.ToLower() == miejscModel.Woj.ToLower()
                                    select TupleFrom(advert, gmina, pow, woj, miejsc),

                [typeof(GminModel)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                      where advert.GmiID == miejscModel.GmiID
                                      join gmina in TerytDb.Gmi.AsNoTracking().AsParallel()
                                      on advert.GmiID equals gmina.GmiID
                                      select TupleFrom(advert, gmina),

                [typeof(IGmin)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                  join gmina in TerytDb.Gmi.Include(x => x.Pow.Woj).AsNoTracking().AsParallel()
                                  on advert.GmiID equals gmina.GmiID
                                  let pow = gmina.Pow
                                  let woj = pow.Woj
                                  where gmina.Name.ToLower() == miejscModel.Gmin.ToLower() &&
                                        pow.Nazwa.ToLower() == miejscModel.Pow.ToLower() &&
                                        woj.Nazwa.ToLower() == miejscModel.Woj.ToLower()
                                  select TupleFrom(advert, gmina, pow, woj),


                [typeof(PowModel)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                     where advert.PowID == miejscModel.PowID
                                     join pow in TerytDb.Pow.AsNoTracking().AsParallel()
                                     on advert.PowID equals pow.PowID
                                     select TupleFrom(advert, pow:pow),

                [typeof(IPow)] = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                                 join pow in TerytDb.Pow.AsNoTracking().AsParallel()
                                 on advert.PowID equals pow.PowID
                                 where pow.Nazwa.ToLower() == miejscModel.Pow.ToLower() &&
                                       pow.Woj.Nazwa.ToLower() == miejscModel.Woj.ToLower()
                                 select TupleFrom(advert, pow: pow),
            };

            
            var typeHasAll = (from type in new[] { typeof(MiejscModel), typeof(GminModel), typeof(IGmin), typeof(PowModel), typeof(IPow) }
                              select new
                              {
                                  type,
                                  hasAll = type.GetProperties().Select(x => x.GetValue(miejscModel)).All(x => x != null)
                              }).FirstOrDefault(x => x.hasAll)?.type;


            return typeHasAll is null ? Enumerable.Empty<Advertisment>() : AggregateQuery(queries[typeHasAll]);

        }

        (Advertisment, Miejsc, Gmi, Pow, Woj) TupleFrom(Advertisment advert, 
                                                        Gmi gmina = null, 
                                                        Pow pow = null, 
                                                        Woj woj = null, 
                                                        Miejsc miejsc = null) 
            => (advert, miejsc, gmina, pow, woj);

        private IEnumerable<Advertisment> AggregateQuery(ParallelQuery<(Advertisment, Miejsc, Gmi, Pow, Woj)> query, 
                                                         Func<Miejsc, Gmi, Pow, Woj, object> map = null)
        {
            var result = query.Aggregate(new List<Advertisment>(), (list, tuple) =>
            {
                var (advert, miejsc, gmina, pow, woj) = tuple;
                gmina =  gmina  ?? (advert.GmiID is null ? null : pow.Gmi.FirstOrDefault(x => x.GmiID == advert.GmiID));
                miejsc = miejsc ?? (advert.SYM is null ? null : gmina.Miejsc.FirstOrDefault(x => x.SYM == advert.SYM));
                pow = pow ?? gmina.Pow;
                woj = woj ?? pow.Woj;
                advert.City = map?.Invoke(miejsc, gmina, pow, woj) ?? new {Miejsc = miejsc?.Nazwa, Gmin = gmina?.Name, Pow = pow.Nazwa, Woj = woj.Nazwa, miejsc?.RM, gmina?.RodzID };
                list.Add(advert);
                return list;
            });

            return result;
        }

        [HttpGet, Route("{id:guid}/user/picture")]
        public async Task<IHttpActionResult> GetUserPictureAsync(Guid id) //pobierz zdjecie użytkownika
        {
            Advertisment advertisment = await Db.Advertisments.FindAsync(id);
            return Ok(await advertisment?.GetUserImageAsync());
        }

        [Route("{id:guid}")]
        public async Task<IHttpActionResult> GetAsync(Guid id) => Json(await Db.Advertisments.FindAsync(id));

        [HttpGet, Authorize, Route("user")]
        public IEnumerable<Advertisment> GetUserAdvertisments()
        {
            var userId = User.Identity.GetUserId();
            var query = from advert in Db.Advertisments.AsNoTracking().AsParallel()
                        where userId == advert.UserId
                        join pow in TerytDb.Pow.AsNoTracking().AsParallel()
                        on advert.PowID equals pow.PowID
                        select TupleFrom(advert, pow: pow);

            #region old
            //var query = from advert in Db.Advertisments.AsNoTracking().AsParallel()
            //            where userId == advert.UserId
            //            join gmina in TerytDb.Gmi.AsNoTracking().AsParallel()
            //            on advert.GmiID equals gmina.GmiID
            //            select TupleFrom(advert, gmina);
            #endregion


            return AggregateQuery(query, map: (miejsc, gmina, pow, woj) => new
            {
                miejsc = miejsc?.Nazwa,
                gmin = gmina?.Name,
                pow = pow.Nazwa,
                woj = woj.Nazwa,
                wojId = woj.WojID,
                powID = pow.PowID,
                gmiID = gmina?.GmiID,
                sym = miejsc?.SYM
            });
        }
       
        [HttpPut, Route("{id:guid}"), Authorize, Expiration(minutes: 3), HashVerify, HasCompoleteInfo]
        public async Task<IHttpActionResult> PutAsync([FromUri] Guid id, Models.Advertisments.PutAdvertisment _advertisment)
        {
            _advertisment.UserId = User.Identity.GetUserId();
            var oldAdvartisment = await Repository.FindAsync(id);
            var (statusCode, action) = oldAdvartisment is null ? (HttpStatusCode.Created,  (Action<Task>)(task => Repository.AddAsync(id, _advertisment))) :
                                                                 (HttpStatusCode.Accepted, (Action<Task>)(task => Repository.UpdateAsync(oldAdvartisment, _advertisment)));
            await _advertisment.SaveNewImagesAsync().ContinueWith(action);
            return StatusCode(statusCode);
        }
        
        [HttpDelete, Route("{id:guid}"), Authorize]
        public async Task<IHttpActionResult> DeleteAsync(Guid id)
        {
            Advertisment advertisment = await Db.Advertisments.FindAsync(id);
            if (advertisment.UserId != User.Identity.GetUserId()) return Unauthorized();
            Db.Entry(advertisment).State = EntityState.Deleted;
            Db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.Accepted);
        }

        [HttpGet, Route("hints")]
        public async Task<IHttpActionResult> GetHintsAsync()
        {
            var hints = await Task.WhenAll(new[] { typeof(Equipment), typeof(Media), typeof(Kind), typeof(Heating), typeof(ExtraInfo) }.Select(x => fetchParallelAsync(x)));
            return Json(hints.ToDictionary(keySelector: x => x.Key, elementSelector: x => x.Value));

            async Task<KeyValuePair<string, IEnumerable<object>>> fetchParallelAsync(Type type)
            {
                using (var dbContext = new DatabaseContext()) return new KeyValuePair<string, IEnumerable<object>>(key: type.Name, value: await dbContext.Set(type).ToListAsync());
            }
        }
    }
}

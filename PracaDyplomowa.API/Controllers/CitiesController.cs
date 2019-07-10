using Newtonsoft.Json;
using PracaDyplomowa.API.DAL;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Caching;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace PracaDyplomowa.API.Controllers
{
    public interface ISortBy <TSortFirst, TSortThen>
    {
        TSortFirst First { get; }
        TSortThen Name { get; }
        string Woj { get; }
        string Pow { get; }
    }

    interface IPow
    {
        string Pow { get; set; }
        string Woj { get; set; }
    }

    interface IGmin: IPow
    {
        string Gmin { get; set; }
    }

    interface IMiejsc: IGmin
    {
        string Miejsc { get; set; }
    }

    public class PowModel : IPow
    {
       
        public string Pow { get; set; }
        public string Woj { get; set; }
        public int? PowID { get; set; }
        public int? WojId { get; set; }
        public PowModel() { }
        public PowModel(Pow pow)
        {
            Pow = pow.Nazwa;
            PowID = pow.PowID;
            Woj = pow.Woj.Nazwa;
            WojId = pow.WojID;
        }
    }

    public class GminModel : PowModel, IGmin
    {
        public string Gmin { get; set; }
        public int RodzID { get; set; }
        public int? GmiID { get; set; }
        public GminModel() { }
        public GminModel(Gmi gmi) : base(gmi.Pow)
        {
            Gmin = gmi.Name;
            RodzID = gmi.RodzID;
            GmiID = gmi.GmiID;
        }
    }

    public class MiejscModel : GminModel, IMiejsc
    {
        public string Miejsc { get; set; }
        public int? SYM { get; set; }
        public int? RM { get; set; }
        public MiejscModel() { }
        public MiejscModel(Miejsc miejsc) : base(miejsc.Gmi)
        {
            Miejsc = miejsc.Nazwa;
            SYM = miejsc.SYM;
            RM = miejsc.RM;
        }
    }

    //public class ComparePowGmiMiejsc : IEqualityComparer<object>
    //{
    //    public new bool Equals(object x, object y)
    //    {
    //        object[] array = new[] { x, y };

    //        if(array.OfType<MiejscModel>().FirstOrDefault() is MiejscModel miejsc1 &&
    //           array.OfType<GminModel>().FirstOrDefault() is GminModel gmin && 
    //           miejsc1.GmiID == gmin.GmiID)
    //        {
    //            return miejsc1.Miejsc == miejsc1.Gmin && miejsc1.Gmin == gmin.Gmin;
    //        }

    //        else if(array.OfType<PowModel>().FirstOrDefault() is PowModel pow &&
    //                array.OfType<MiejscModel>().FirstOrDefault() is MiejscModel miejsc && 
    //                pow.PowID == miejsc.PowID)
    //        {
    //            return miejsc.Miejsc == miejsc.Pow && miejsc.Pow == pow.Pow;
    //        }

    //        else return Equals(x, y);
    //    }

    //    public int GetHashCode(object obj)
    //    {
    //        int hcode = obj.GetHashCode();
    //        switch (obj)
    //        {
    //            case MiejscModel miejsc when miejsc.RM != 95: break;

    //            case GminModel gmin when gmin.RodzID == 6:
    //                hcode = gmin.GmiID.GetHashCode() ^ gmin.PowID.GetHashCode();
    //            break;

    //            case GminModel gminModel : break;

    //            case PowModel pow: hcode = pow.PowID.GetHashCode(); break;
    //        }
    //        return hcode;
    //    }
    //}

    //public class ComparePowGmi : IEqualityComparer<object>
    //{
    //    public new bool Equals(object left, object right)
    //    {
    //        object[] array = new[] { left, right };
    //        if (array.OfType<GminModel>().FirstOrDefault() is GminModel gmin &&
    //            array.OfType<PowModel>().FirstOrDefault() is PowModel pow &&
    //            gmin.PowID == pow.PowID)
    //        {
    //            return gmin.Gmin == gmin.Pow && gmin.Pow == pow.Pow;
    //        }
    //        return Equals(left, right);
    //    }

    //    public int GetHashCode(object obj)
    //    {
    //        int hcode = obj.GetHashCode();
    //        switch (obj)
    //        {
    //            case GminModel gmin when gmin.Gmin != gmin.Pow: break;
    //            case PowModel pow: hcode = (int) pow.PowID; break;
    //        }
    //        return hcode;
    //    }
    //}


    [RoutePrefix("api/cities")]
    public class CitiesController : ApplicationController
    {
        private readonly DAL.TERYT teryt = new DAL.TERYT();

        private readonly static MemoryCache cache = MemoryCache.Default;

        private (IEnumerable<object>, IEnumerable<object>, IEnumerable<object>) GetFromDb(char firstLetter)
        {
            var pow = teryt.Pow.AsNoTracking().Include(x => x.Woj).AsParallel().Where(x => x.Nazwa[0].ToString().ToLower().First() == firstLetter);
            var gmin = teryt.Gmi.AsNoTracking().Include(x => x.Rodz).Include(x => x.Pow.Woj).AsParallel().Where(x => x.Name[0].ToString().ToLower().First() == firstLetter);
            var miejsc = teryt.Miejsc.AsNoTracking().Include(x => x.Gmi.Rodz).Include(x => x.Gmi.Pow.Woj).AsParallel().Where(x => x.Nazwa[0].ToString().ToLower().First() == firstLetter);
            var result = (pow.ToList().AsEnumerable<object>(), gmin.ToList().AsEnumerable<object>(), miejsc.ToList().AsEnumerable<object>());
            cache.Add(firstLetter.ToString(), result, DateTimeOffset.UtcNow.AddMinutes(8));
            return result;
        }


        public class CityQuery
        {
            [Required, RegularExpression("^[a-zA-z]+$")]
            public string Query { get; set; }
        }

        [HttpGet, Route("")]
        public IEnumerable fooAsync([FromUri] CityQuery model)
        {
            if (!ModelState.IsValid) return Enumerable.Empty<object>();
            var query = model.Query.ToLower();
            string firstLetter = query[0].ToString();

            var (powQuery, gmiQuery, miejscQuery) = cache.Contains(firstLetter) ? (ValueTuple<IEnumerable<object>, IEnumerable<object>, IEnumerable<object>>) cache.Get(firstLetter) : GetFromDb(firstLetter.First());


            powQuery = from pow in powQuery.AsParallel().Cast<Pow>()
                       where pow.Nazwa.ToLower().StartsWith(query)
                       select new PowModel(pow) into pow
                       orderby pow.Pow, pow.Woj
                       select pow;

            gmiQuery = from gmi in gmiQuery.AsParallel().Cast<Gmi>()
                       where gmi.Name != gmi.Pow.Nazwa && gmi.Name.ToLower().StartsWith(query)
                       select new GminModel(gmi) into gmi
                       orderby gmi.Gmin, gmi.Pow, gmi.Woj
                       select gmi;

            miejscQuery = from miejsc in miejscQuery.AsParallel().Cast<Miejsc>()
                          where (miejsc.Nazwa != miejsc.Gmi.Name || miejsc.RM == 99) && miejsc.Nazwa.ToLower().StartsWith(query)
                          select new MiejscModel(miejsc) into miejsc
                          orderby miejsc.Miejsc, miejsc.Gmin, miejsc.Pow, miejsc.Woj
                          select miejsc;

            return powQuery.Concat(gmiQuery).Concat(miejscQuery);
             
        }
    }
}

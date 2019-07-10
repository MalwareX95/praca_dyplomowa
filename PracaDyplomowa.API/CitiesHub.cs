using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using PracaDyplomowa.API.DAL;
using System.Data.Entity;
using System.Runtime.Caching;
using System.Threading.Tasks;
using PracaDyplomowa.API.Controllers;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace PracaDyplomowa.API
{
    public class CitiesHub : Hub
    {
        class ClientQuery : IDisposable
        {
            private readonly static Lazy<IHubConnectionContext<dynamic>> _Clients = new Lazy<IHubConnectionContext<dynamic>>(() => GlobalHost.ConnectionManager.GetHubContext<CitiesHub>().Clients);
            private IHubConnectionContext<dynamic> Clients => _Clients.Value;
            private static readonly ConcurrentDictionary<string, ClientQuery> ConcurrentDictionary = new ConcurrentDictionary<string, ClientQuery>();
            private CancellationTokenSource CancellationSource = new CancellationTokenSource();
            private Timer Timer;
            private ClientQuery(string connectionId, string query, Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)> setTask)
            {
                Timer = new Timer(async delegate
                {
                    var (powQuery, gmiQuery, miejscQuery) = await setTask;

                    powQuery = from pow in powQuery.AsParallel().WithCancellation(CancellationSource.Token).Cast<Pow>()
                               where pow.Nazwa.ToLower().StartsWith(query)
                               select new PowModel(pow) into pow
                               orderby pow.Pow, pow.Woj
                               select pow;

                    gmiQuery = from gmi in gmiQuery.AsParallel().WithCancellation(CancellationSource.Token).Cast<Gmi>()
                               where gmi.Name != gmi.Pow.Nazwa && gmi.Name.ToLower().StartsWith(query)
                               select new GminModel(gmi) into gmi
                               orderby gmi.Gmin, gmi.Pow, gmi.Woj
                               select gmi;

                    miejscQuery = from miejsc in miejscQuery.AsParallel().WithCancellation(CancellationSource.Token).Cast<Miejsc>()
                                  where (miejsc.Nazwa != miejsc.Gmi.Name || miejsc.RM == 99) && miejsc.Nazwa.ToLower().StartsWith(query)
                                  select new MiejscModel(miejsc) into miejsc
                                  orderby miejsc.Miejsc, miejsc.Gmin, miejsc.Pow, miejsc.Woj
                                  select miejsc;

                    if (!CancellationSource.IsCancellationRequested)
                    {
                        try
                        {
                            Clients.Client(connectionId).citiesResult(powQuery.Concat(gmiQuery).Concat(miejscQuery));
                        }
                        catch(OperationCanceledException){}
                    }
                }, null, 200, Timeout.Infinite);
            }
            public static void EvalQuery(string query, string connectionId, Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)> setTask)
            {
                ConcurrentDictionary.AddOrUpdate(key: connectionId,
                                                 addValueFactory: key => new ClientQuery(key, query, setTask),
                                                 updateValueFactory: (key, oldClientQuery) =>
                                                 {
                                                     oldClientQuery.Dispose();
                                                     return new ClientQuery(connectionId, query, setTask);
                                                 });

            }
            public void Dispose()
            {
                CancellationSource.Cancel();
            }
        }

        class RecordsQuery
        {
            private readonly static MemoryCache cache = MemoryCache.Default;
            private readonly object lockObj = new object();
            public readonly string Letter;
            public RecordsQuery(string letter)
            {
                Letter = letter;
            }
            public Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)> GetCollectionAsync()
            {
                lock (lockObj)
                {
                    return cache.Contains(Letter) ? getFromCacheAsync() : getFromDbAsync();
                    Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)> getFromCacheAsync() 
                        => (Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)>)cache.Get(Letter);
                    Task<(IEnumerable<object>, IEnumerable<object>, IEnumerable<object>)> getFromDbAsync()
                    {
                        var taskResult = Task.Run(() =>
                        {
                            using (var teryt = new TERYT())
                            {
                                var pow = teryt.Pow.AsNoTracking()
                                                    .Include(x => x.Woj)
                                                    .AsParallel()
                                                    .Where(x => x.Nazwa[0].ToString().ToLower() == Letter);
                                var gmin = teryt.Gmi.AsNoTracking()
                                                     .Include(x => x.Rodz)
                                                     .Include(x => x.Pow.Woj)
                                                     .AsParallel()
                                                     .Where(x => x.Name[0].ToString().ToLower() == Letter);
                                var miejsc = teryt.Miejsc.AsNoTracking()
                                                         .Include(x => x.Gmi.Rodz)
                                                         .Include(x => x.Gmi.Pow.Woj)
                                                         .AsParallel()
                                                         .Where(x => x.Nazwa[0].ToString().ToLower() == Letter);
                                var result = (pow.ToList().AsEnumerable<object>(), 
                                              gmin.ToList().AsEnumerable<object>(), 
                                              miejsc.ToList().AsEnumerable<object>());
                                return result;
                            }
                        });
                        cache.Add(Letter, taskResult, DateTimeOffset.UtcNow.AddMinutes(8));
                        return taskResult;
                    }
                }
            }
        }

        private readonly static ConcurrentDictionary<string, RecordsQuery> RecordsQueryDictionary = new ConcurrentDictionary<string, RecordsQuery>();

        public void Cities(string query)
        {

            if (string.IsNullOrEmpty(query) || !Regex.IsMatch(query, @"^[a-żA-Ż]+$"))
            {
                Clients.Client(Context.ConnectionId).citiesResult(Enumerable.Empty<object>()); return;
            }
            query = query.ToLower();
            var recordQuery = RecordsQueryDictionary.GetOrAdd(key: query[0].ToString(), valueFactory: key => new RecordsQuery(key));
            ClientQuery.EvalQuery(query, Context.ConnectionId, recordQuery.GetCollectionAsync());
        }
    }
}
namespace PracaDyplomowa.API.DAL
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class TERYT : DbContext
    {
        public TERYT()
            : base("name=TERYT")
        {
        }

        public virtual DbSet<Gmi> Gmi { get; set; }
        public virtual DbSet<Miejsc> Miejsc { get; set; }
        public virtual DbSet<Pow> Pow { get; set; }
        public virtual DbSet<Rodz> Rodz { get; set; }
        public virtual DbSet<Woj> Woj { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }
}

namespace PracaDyplomowa.API.DAL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Pow")]
    public partial class Pow
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Pow()
        {
            Gmi = new HashSet<Gmi>();
        }

        public int PowID { get; set; }

        public string Nazwa { get; set; }

        public int WojID { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Gmi> Gmi { get; set; }

        public virtual Woj Woj { get; set; }
    }
}

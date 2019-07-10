namespace PracaDyplomowa.API.DAL
{
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Gmi")]
    public partial class Gmi
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Gmi()
        {
            Miejsc = new HashSet<Miejsc>();
        }

        public int GmiID { get; set; }

        public int TmpWoj { get; set; }

        public int TmpRodz { get; set; }

        public int TmpPow { get; set; }

        public int TmpGmi { get; set; }

        public int PowID { get; set; }

        public string Name { get; set; }

        public int RodzID { get; set; }

        [JsonIgnore]
        public virtual Pow Pow { get; set; }

        public virtual Rodz Rodz { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Miejsc> Miejsc { get; set; }
    }
}

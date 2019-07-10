namespace PracaDyplomowa.API.DAL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Miejsc")]
    public partial class Miejsc
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int SYM { get; set; }

        public byte RM { get; set; }

        public bool MZ { get; set; }

        [StringLength(40)]
        public string Nazwa { get; set; }

        public int SYMPOD { get; set; }

        public int GmiID { get; set; }

        public virtual Gmi Gmi { get; set; }
    }
}

import { Mosque } from "@/data/mosques";
import { motion } from "framer-motion";

interface Props {
  mosque: Mosque;
  onClick: () => void;
}

export default function MosqueCard({ mosque, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      className="mosque-card w-full text-left animate-fade-in"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base text-foreground truncate">
            {mosque.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mosque.distanceMiles} miles away
          </p>
        </div>
        <span className={mosque.isOpen ? "badge-open" : "badge-closed"}>
          {mosque.isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {mosque.hasFemaleSpace && <span className="facility-chip">🕌 Female Space</span>}
        {mosque.hasWudu && <span className="facility-chip">🚿 Wudu</span>}
        {mosque.jummuahTime && <span className="facility-chip">🕐 Jumu'ah</span>}
      </div>
    </motion.button>
  );
}

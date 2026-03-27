import { motion } from "framer-motion";

interface Props {
  onContinue: () => void;
}

export default function SplashScreen({ onContinue }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-card px-8 relative overflow-hidden">
      {/* Gradient wash */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-mint/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Crescent motif */}
        <div className="w-20 h-20 mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-forest" />
          <div className="absolute top-1 right-1 w-14 h-14 rounded-full bg-card" />
        </div>

        <h1 className="font-display text-4xl font-extrabold text-forest tracking-tight">
          Musmapp
        </h1>
        <p className="text-lg text-foreground/80 mt-3 font-medium leading-snug">
          Find your prayer space,
          <br />
          wherever you are
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-[260px]">
          Built for the moment you're out and need to pray now
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onContinue}
          className="btn-primary mt-10 text-base"
        >
          Enable location
        </motion.button>
      </motion.div>
    </div>
  );
}

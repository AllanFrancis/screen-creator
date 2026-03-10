import { Clock, Dumbbell, Calendar } from "lucide-react";

interface WorkoutCardProps {
  day: string;
  title: string;
  duration: string;
  exercises: number;
  image: string;
  onClick?: () => void;
}

const WorkoutCard = ({ day, title, duration, exercises, image, onClick }: WorkoutCardProps) => {
  return (
    <button
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl text-left"
      style={{ aspectRatio: "16/9" }}
    >
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="gradient-hero absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground">
          <Calendar className="h-3 w-3" />
          {day}
        </span>
        <div>
          <h3 className="text-xl font-bold text-hero-dark-foreground">{title}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-hero-dark-foreground/80">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {duration}
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" /> {exercises} exercícios
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default WorkoutCard;

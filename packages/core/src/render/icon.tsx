import {
  Award, Baby, Briefcase, CalendarDays, Camera, Car, Check, Clock, Dog, Droplets, Dumbbell, Flame, Hammer, Heart, House,
  KeyRound, Leaf, Mail, MapPin, Paintbrush, PawPrint, Phone, Scissors, ShieldCheck, Smile, Snowflake, Sparkles, Star,
  Stethoscope, Thermometer, ThumbsUp, Trees, Truck, Bug, Users, Utensils, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import type { IconKey } from "../sections/icons";

const ICONS: Record<IconKey, LucideIcon> = {
  wrench: Wrench, droplets: Droplets, flame: Flame, zap: Zap, home: House, leaf: Leaf, scissors: Scissors, paw: PawPrint,
  heart: Heart, star: Star, shield: ShieldCheck, clock: Clock, phone: Phone, mail: Mail, "map-pin": MapPin, check: Check,
  calendar: CalendarDays, sparkles: Sparkles, users: Users, truck: Truck, hammer: Hammer, paintbrush: Paintbrush, car: Car,
  stethoscope: Stethoscope, dumbbell: Dumbbell, utensils: Utensils, camera: Camera, briefcase: Briefcase,
  thermometer: Thermometer, snowflake: Snowflake, trees: Trees, bug: Bug, key: KeyRound, baby: Baby, dog: Dog,
  award: Award, "thumbs-up": ThumbsUp, smile: Smile,
};

export function Icon({ name, size = 24 }: { name: IconKey; size?: number }) {
  const C = ICONS[name];
  return <C size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" />;
}

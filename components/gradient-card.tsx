import { Location, PressureGradient } from "@/types/location";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatGradient,
  formatPressure,
  interpretGradient,
} from "@/lib/calculations/gradient";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface GradientCardProps {
  gradient: PressureGradient;
}

export function GradientCard({ gradient }: GradientCardProps) {
  const interpretation = interpretGradient(gradient.difference);
  
  const getIcon = () => {
    if (gradient.difference > 0.5) {
      return <ArrowUpRight className="h-5 w-5" />;
    } else if (gradient.difference < -0.5) {
      return <ArrowDownRight className="h-5 w-5" />;
    }
    return <Minus className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{gradient.compareLocation.name}</span>
          <span className={`flex items-center gap-1 ${interpretation.color}`}>
            {getIcon()}
            {formatGradient(gradient.difference)}
          </span>
        </CardTitle>
        <CardDescription>{gradient.compareLocation.code}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {gradient.homeLocation.name}:
          </span>
          <span className="font-medium">
            {formatPressure(gradient.homePressure)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {gradient.compareLocation.name}:
          </span>
          <span className="font-medium">
            {formatPressure(gradient.comparePressure)}
          </span>
        </div>
        <div className="pt-2 border-t">
          <div className={`text-sm font-semibold ${interpretation.color}`}>
            {interpretation.label}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {interpretation.description}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Updated: {new Date(gradient.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </div>
      </CardContent>
    </Card>
  );
}

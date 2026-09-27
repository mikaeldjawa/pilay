import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ObjectiveWritingGuidance() {
  return (
    <Alert>
      <Info />
      <AlertTitle>Write objectively, not subjectively</AlertTitle>
      <AlertDescription>
        Describe what a camera would have recorded — actions, words, and
        observable outcomes. Avoid inferring intent or motive (e.g. write
        &quot;Student raised their voice and pointed at the other student&quot;
        rather than &quot;Student was trying to intimidate the other student&quot;).
      </AlertDescription>
    </Alert>
  );
}

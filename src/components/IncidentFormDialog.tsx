import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Upload,
  Calendar,
  Clock,
  User,
  Mail,
  FileText,
  Send,
  X,
} from "lucide-react";

interface IncidentFormData {
  incidentType: string;
  severityLevel: string;
  dateTime: string;
  description: string;
  attachments: File[];
  reporterName: string;
  reporterEmail: string;
}

const incidentTypes = [
  { value: "network-issue", label: "Network Issue" },
  { value: "ai-agent-error", label: "AI Agent Error" },
  { value: "security-breach", label: "Security Breach" },
  { value: "system-outage", label: "System Outage" },
  { value: "performance-degradation", label: "Performance Degradation" },
  { value: "data-corruption", label: "Data Corruption" },
  { value: "authentication-failure", label: "Authentication Failure" },
  { value: "other", label: "Other" },
];

const severityLevels = [
  {
    value: "low",
    label: "Low",
    color: "text-green-700 bg-green-100 border-green-200",
    description: "Minor issue with minimal impact",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-yellow-700 bg-yellow-100 border-yellow-200",
    description: "Moderate issue affecting some users",
  },
  {
    value: "high",
    label: "High",
    color: "text-orange-700 bg-orange-100 border-orange-200",
    description: "Significant issue affecting many users",
  },
  {
    value: "critical",
    label: "Critical",
    color: "text-red-700 bg-red-100 border-red-200",
    description: "System-wide failure requiring immediate attention",
  },
];

interface IncidentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentFormDialog({
  open,
  onOpenChange,
}: IncidentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IncidentFormData>({
    incidentType: "",
    severityLevel: "",
    dateTime: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    description: "",
    attachments: [],
    reporterName: "Demo User", // Retrieved from user context
    reporterEmail: "demo@fusion.ai", // Retrieved from user context
  });

  const updateFormData = (field: keyof IncidentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.incidentType) {
      toast({
        title: "Validation Error",
        description: "Please select an incident type.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.severityLevel) {
      toast({
        title: "Validation Error",
        description: "Please select a severity level.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an incident description.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.description.trim().length < 10) {
      toast({
        title: "Validation Error",
        description:
          "Incident description must be at least 10 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Incident Reported Successfully",
        description:
          "Your incident report has been submitted and will be reviewed by our team.",
        variant: "default",
      });

      // Reset form and close dialog
      setFormData({
        incidentType: "",
        severityLevel: "",
        dateTime: new Date().toISOString().slice(0, 16),
        description: "",
        attachments: [],
        reporterName: "Demo User",
        reporterEmail: "demo@fusion.ai",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting incident report:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your incident report. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      incidentType: "",
      severityLevel: "",
      dateTime: new Date().toISOString().slice(0, 16),
      description: "",
      attachments: [],
      reporterName: "Demo User",
      reporterEmail: "demo@fusion.ai",
    });
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Incident Reporting
          </DialogTitle>
          <DialogDescription>
            Report system issues, security incidents, or AI agent errors. Our
            team will review and respond to your report promptly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type */}
          <div className="space-y-2">
            <Label
              htmlFor="incident-type"
              className="text-sm font-medium text-gray-700"
            >
              Incident Type *
            </Label>
            <Select
              value={formData.incidentType}
              onValueChange={(value) => updateFormData("incidentType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select the type of incident" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Severity Level *
            </Label>
            <RadioGroup
              value={formData.severityLevel}
              onValueChange={(value) => updateFormData("severityLevel", value)}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {severityLevels.map((level) => (
                <div key={level.value}>
                  <RadioGroupItem
                    value={level.value}
                    id={level.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={level.value}
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-all peer-checked:border-2 peer-checked:${level.color.split(" ")[2]} peer-checked:${level.color}`}
                  >
                    <span className="text-sm font-semibold">{level.label}</span>
                    <span className="text-xs text-gray-500 text-center mt-1">
                      {level.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="date-time"
                className="text-sm font-medium text-gray-700 flex items-center space-x-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Incident Date & Time *</span>
              </Label>
              <Input
                type="datetime-local"
                id="date-time"
                value={formData.dateTime}
                onChange={(e) => updateFormData("dateTime", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Current Time</span>
              </Label>
              <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Incident Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Incident Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the incident, including what happened, when it occurred, and any steps you've already taken..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={6}
              className="w-full resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.description.length} characters (minimum 10 required)
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Attachments</span>
            </Label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Upload screenshots, logs, or other relevant files
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: PNG, JPG, PDF, TXT, LOG (Max 10MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {/* Attachment List */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Selected Files:
                </Label>
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reporter Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Reporter Information
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Name</span>
                </Label>
                <Input
                  value={formData.reporterName}
                  readOnly
                  className="bg-white/50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </Label>
                <Input
                  value={formData.reporterEmail}
                  readOnly
                  className="bg-white/50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Submit Incident Report</span>
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Help Section */}
        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                  Need Immediate Assistance?
                </h3>
                <p className="text-xs text-blue-700 mb-2">
                  For critical incidents requiring immediate attention, contact
                  our emergency support team:
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>📞 Emergency Hotline: +1 (555) 123-4567</p>
                  <p>📧 Critical Support: critical@fusion.ai</p>
                  <p>💬 Live Chat: Available 24/7 through the support portal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"

interface AppealPropertyDialogProps {
  propertyId: string
  propertyTitle: string
  onSuccess?: () => void
}

export function AppealPropertyDialog({ propertyId, propertyTitle, onSuccess }: AppealPropertyDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for your appeal",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/appeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit appeal")
      }

      toast({
        title: "Success",
        description: "Appeal submitted successfully. Our team will review it.",
      })

      setOpen(false)
      setReason("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit appeal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Appeal Rejection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Appeal Property Rejection</DialogTitle>
          <DialogDescription>
            Explain why you believe this property should be approved. Our moderation team will review your appeal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Property: {propertyTitle}</h3>
            <Textarea
              placeholder="Explain why this property should be approved..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Appeal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

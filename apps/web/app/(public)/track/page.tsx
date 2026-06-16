"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

export default function TrackPage() {
  const router = useRouter()
  const [trackingNo, setTrackingNo] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNo.trim()) {
      setError("Vui lòng nhập mã vận đơn")
      return
    }
    setError("")
    router.push(`/track/${trackingNo.trim()}`)
  }

  return (
    <div className="container mx-auto max-w-lg py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Tra cứu đơn hàng</CardTitle>
          <CardDescription>Nhập mã vận đơn để xem trạng thái và lịch sử vận chuyển</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Input
                placeholder="VD: VN20260616001"
                value={trackingNo}
                onChange={(e) => {
                  setTrackingNo(e.target.value)
                  setError("")
                }}
                className="h-11 text-center font-mono"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Tra cứu ngay
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Mã demo để thử:</p>
            <div className="flex flex-wrap gap-2">
              {["VN20260616001", "VN20260615002", "VN20260616003"].map((code) => (
                <button
                  key={code}
                  onClick={() => setTrackingNo(code)}
                  className="text-xs font-mono bg-background border rounded px-2 py-1 hover:border-primary hover:text-primary transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CommitteeInfoPage() {
  const [buildingName, setBuildingName] = useState("Oceanview Apartments")
  const [address, setAddress] = useState("123 Beach Road, Sydney NSW 2000")
  const [committeeMembers, setCommitteeMembers] = useState([
    { name: "John Smith", role: "Chairperson", contact: "john.smith@example.com" },
    { name: "Sarah Johnson", role: "Secretary", contact: "sarah.j@example.com" },
    { name: "Michael Wong", role: "Treasurer", contact: "m.wong@example.com" },
  ])
  const [meetingSchedule, setMeetingSchedule] = useState("First Tuesday of every month at 7:00 PM")
  const [notes, setNotes] = useState("Next AGM scheduled for November 15th.")
  const [isEditing, setIsEditing] = useState(false)

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...committeeMembers]
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setCommitteeMembers(updatedMembers)
  }

  const handleAddMember = () => {
    setCommitteeMembers([...committeeMembers, { name: "", role: "", contact: "" }])
  }

  const handleRemoveMember = (index) => {
    const updatedMembers = committeeMembers.filter((_, i) => i !== index)
    setCommitteeMembers(updatedMembers)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Strata Committee Information</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Building Details</span>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "View" : "Edit"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buildingName">Building Name</Label>
                  <Input id="buildingName" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                  <Input
                    id="meetingSchedule"
                    value={meetingSchedule}
                    onChange={(e) => setMeetingSchedule(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Building Name</h3>
                  <p>{buildingName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p>{address}</p>
                </div>
                <div>
                  <h3 className="font-medium">Meeting Schedule</h3>
                  <p>{meetingSchedule}</p>
                </div>
                <div>
                  <h3 className="font-medium">Notes</h3>
                  <p className="whitespace-pre-wrap">{notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Committee Members</span>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={handleAddMember}>
                  Add Member
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                {committeeMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center border p-2 rounded-md">
                    <div className="col-span-4">
                      <Label htmlFor={`name-${index}`}>Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`role-${index}`}>Role</Label>
                      <Input
                        id={`role-${index}`}
                        value={member.role}
                        onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor={`contact-${index}`}>Contact</Label>
                      <Input
                        id={`contact-${index}`}
                        value={member.contact}
                        onChange={(e) => handleMemberChange(index, "contact", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 self-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(index)}
                        disabled={committeeMembers.length <= 1}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committeeMembers.map((member, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{member.name}</td>
                        <td className="py-2">{member.role}</td>
                        <td className="py-2">{member.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Plus, Settings2, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AVAILABLE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  { id: "backlog", label: "Backlog" },
  { id: "members", label: "Members" },
  { id: "chat", label: "Chat" },
  { id: "cost", label: "Cost" },
  { id: "settings", label: "Settings" },
];

// Mock Initial Data
const INITIAL_ROLES = [
  { id: "r1", name: "Admin", permissions: ["overview", "board", "backlog", "members", "chat", "cost", "settings"] },
  { id: "r2", name: "DEV", permissions: ["overview", "board", "backlog", "chat"] },
  { id: "r3", name: "Viewer", permissions: ["overview"] },
];

const INITIAL_MEMBERS = [
  { id: "m1", name: "Alice Admin", email: "alice@example.com", roleId: "r1", extraPermissions: [] },
  { id: "m2", name: "Bob Dev", email: "bob@example.com", roleId: "r2", extraPermissions: ["cost"] }, // Bob can see cost too
  { id: "m3", name: "Charlie Dev", email: "charlie@example.com", roleId: "r2", extraPermissions: [] },
];

export function MembersClient() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  
  // Modals state
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Edit member state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberRoleId, setEditMemberRoleId] = useState<string>("");
  const [editMemberExtraPerms, setEditMemberExtraPerms] = useState<string[]>([]);
  
  // New role state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Add member state
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRoleId, setNewMemberRoleId] = useState("");

  const editingMember = members.find(m => m.id === editingMemberId);
  const editingMemberRole = roles.find(r => r.id === editMemberRoleId);
  
  // --- Actions ---

  const handleOpenEditMember = (member: typeof INITIAL_MEMBERS[0]) => {
    setEditingMemberId(member.id);
    setEditMemberRoleId(member.roleId);
    setEditMemberExtraPerms(member.extraPermissions);
    setIsEditMemberOpen(true);
  };

  const handleSaveMember = () => {
    if (!editingMemberId) return;
    setMembers(prev => prev.map(m => {
      if (m.id === editingMemberId) {
        return { ...m, roleId: editMemberRoleId, extraPermissions: editMemberExtraPerms };
      }
      return m;
    }));
    setIsEditMemberOpen(false);
  };
  
  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };
  
  const handleAddMember = () => {
    if (!newMemberEmail || !newMemberName || !newMemberRoleId) return;
    const newMember = {
      id: "m" + Date.now(),
      name: newMemberName,
      email: newMemberEmail,
      roleId: newMemberRoleId,
      extraPermissions: [],
    };
    setMembers([...members, newMember]);
    setIsAddMemberOpen(false);
    setNewMemberEmail("");
    setNewMemberName("");
    setNewMemberRoleId("");
  };

  const handleCreateRole = () => {
    if (!newRoleName) return;
    const newRole = {
      id: "r" + Date.now(),
      name: newRoleName,
      permissions: newRolePerms,
    };
    setRoles([...roles, newRole]);
    setNewRoleName("");
    setNewRolePerms([]);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleRolePermToggle = (roleId: string, tabId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        const perms = r.permissions.includes(tabId) 
          ? r.permissions.filter(p => p !== tabId)
          : [...r.permissions, tabId];
        return { ...r, permissions: perms };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Members</h2>
          <p className="text-muted-foreground">
            Manage who has access to this project and their permissions.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Manage Groups (Roles) Modal */}
          <Dialog open={isManageRolesOpen} onOpenChange={setIsManageRolesOpen}>
            <Button variant="outline" onClick={() => setIsManageRolesOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Manage Groups
            </Button>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Permission Groups</DialogTitle>
                <DialogDescription>
                  Create groups and assign tab access permissions to them.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Existing Groups */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Existing Groups</h4>
                  {roles.map(role => (
                    <div key={role.id} className="border rounded-md p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{role.name}</div>
                        {role.id !== "r1" && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {AVAILABLE_TABS.map(tab => (
                          <div key={tab.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`role-${role.id}-${tab.id}`} 
                              checked={role.permissions.includes(tab.id)}
                              disabled={role.id === "r1"} // Admin role is locked
                              onCheckedChange={() => handleRolePermToggle(role.id, tab.id)}
                            />
                            <Label htmlFor={`role-${role.id}-${tab.id}`}>{tab.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create New Group */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-sm font-medium">Create New Group</h4>
                  <div className="flex gap-4 items-end">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="new-role">Group Name</Label>
                      <Input 
                        id="new-role" 
                        placeholder="e.g. QA, Designer" 
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AVAILABLE_TABS.map(tab => (
                      <div key={tab.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`new-role-${tab.id}`} 
                          checked={newRolePerms.includes(tab.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setNewRolePerms([...newRolePerms, tab.id]);
                            else setNewRolePerms(newRolePerms.filter(p => p !== tab.id));
                          }}
                        />
                        <Label htmlFor={`new-role-${tab.id}`}>{tab.label}</Label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleCreateRole} disabled={!newRoleName}>
                    Add Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Member Modal */}
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <Button onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to this project and assign them to a group.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newMemberName} 
                    onChange={e => setNewMemberName(e.target.value)}
                    placeholder="John Doe" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Group</Label>
                  <Select value={newMemberRoleId} onValueChange={(val) => setNewMemberRoleId(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember} disabled={!newMemberName || !newMemberEmail || !newMemberRoleId}>
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Members Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Effective Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => {
              const role = roles.find(r => r.id === member.roleId);
              const effectivePerms = Array.from(new Set([...(role?.permissions || []), ...member.extraPermissions]));
              
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role?.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {effectivePerms.map(p => {
                        const tab = AVAILABLE_TABS.find(t => t.id === p);
                        const isExtra = !role?.permissions.includes(p);
                        return (
                          <Badge key={p} variant={isExtra ? "default" : "outline"} className="text-[10px] uppercase">
                            {tab?.label} {isExtra && "*"}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditMember(member)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Member Modal */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Permissions</DialogTitle>
            <DialogDescription>
              Change group or add individual extra permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Group</Label>
              <Select value={editMemberRoleId} onValueChange={(val) => setEditMemberRoleId(val || "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <Label>Individual Extra Permissions</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                These are granted in addition to the base permissions of the {editingMemberRole?.name} group.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                {AVAILABLE_TABS.map(tab => {
                  const isGrantedByRole = editingMemberRole?.permissions.includes(tab.id);
                  const hasExtra = editMemberExtraPerms.includes(tab.id);
                  
                  return (
                    <div key={tab.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-perm-${tab.id}`} 
                        checked={isGrantedByRole || hasExtra}
                        disabled={isGrantedByRole}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditMemberExtraPerms([...editMemberExtraPerms, tab.id]);
                          } else {
                            setEditMemberExtraPerms(editMemberExtraPerms.filter(p => p !== tab.id));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`edit-perm-${tab.id}`}
                        className={isGrantedByRole ? "text-muted-foreground" : ""}
                      >
                        {tab.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck, Users, CreditCard, Save } from 'lucide-react';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/store/auth';
import type { User } from '@/types';
import { toast } from 'sonner';

type SeatStatus = 'allocated' | 'pending' | 'unassigned';
type OrgRole = Exclude<User['role'], 'super_admin'>;

interface SeatAssignment {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  team: string;
  status: SeatStatus;
}

interface SeatManagementState {
  planName: string;
  totalSeats: number;
  seats: SeatAssignment[];
  notes: string;
}

const defaultSeats: SeatAssignment[] = [
  {
    id: 'seat-001',
    name: 'Kavita Mehta',
    email: 'kavita@example.com',
    role: 'admin',
    team: 'Sustainability',
    status: 'allocated',
  },
  {
    id: 'seat-002',
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    role: 'manager',
    team: 'Operations',
    status: 'pending',
  },
  {
    id: 'seat-003',
    name: 'Neha Rao',
    email: 'neha@example.com',
    role: 'member',
    team: 'Finance',
    status: 'allocated',
  },
];

const defaultSeatManagement: SeatManagementState = {
  planName: 'Growth',
  totalSeats: 25,
  seats: defaultSeats,
  notes: 'Allocate reviewers to daily/weekly ESG evidence streams and keep the audit trail live.',
};

const roleOptions: Array<{ value: OrgRole; label: string }> = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

const statusOptions: Array<{ value: SeatStatus; label: string }> = [
  { value: 'allocated', label: 'Allocated' },
  { value: 'pending', label: 'Pending' },
  { value: 'unassigned', label: 'Unassigned' },
];

const normalizeSeatManagement = (settings: Record<string, unknown> | null | undefined): SeatManagementState => {
  const seatManagement = settings?.seat_management as Partial<SeatManagementState> | undefined;

  if (!seatManagement) {
    return defaultSeatManagement;
  }

  return {
    planName: typeof seatManagement.planName === 'string' && seatManagement.planName.trim() ? seatManagement.planName : defaultSeatManagement.planName,
    totalSeats:
      typeof seatManagement.totalSeats === 'number' && Number.isFinite(seatManagement.totalSeats)
        ? seatManagement.totalSeats
        : defaultSeatManagement.totalSeats,
    seats: Array.isArray(seatManagement.seats) && seatManagement.seats.length > 0 ? (seatManagement.seats as SeatAssignment[]) : defaultSeats,
    notes: typeof seatManagement.notes === 'string' && seatManagement.notes.trim() ? seatManagement.notes : defaultSeatManagement.notes,
  };
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [settingsText, setSettingsText] = React.useState('{}');
  const [seatManagement, setSeatManagement] = React.useState<SeatManagementState>(defaultSeatManagement);
  const [newSeat, setNewSeat] = React.useState({
    name: '',
    email: '',
    role: 'manager' as OrgRole,
    team: '',
  });

  const { data: orgSettings, isLoading, isError, error } = useQuery({
    queryKey: ['org-settings'],
    queryFn: adminApi.getSettings,
  });

  React.useEffect(() => {
    if (!orgSettings) {
      return;
    }

    setSettingsText(JSON.stringify(orgSettings.settings ?? {}, null, 2));
    setSeatManagement(normalizeSeatManagement(orgSettings.settings ?? {}));
  }, [orgSettings]);

  const updateMutation = useMutation({
    mutationFn: (settings: Record<string, unknown>) => adminApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-settings'] });
      toast.success('Organization settings updated');
    },
    onError: (mutationError: unknown) => {
      const message =
        typeof mutationError === 'object' &&
        mutationError &&
        'response' in mutationError &&
        typeof (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message === 'string'
          ? (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : 'Failed to update settings';
      toast.error(message);
    },
  });

  const handleSave = () => {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(settingsText) as Record<string, unknown>;
    } catch {
      toast.error('Settings must be valid JSON');
      return;
    }

    updateMutation.mutate({
      ...parsed,
      seat_management: {
        ...seatManagement,
        seats: seatManagement.seats,
      },
    });
  };

  const addSeat = () => {
    if (!newSeat.name.trim() || !newSeat.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setSeatManagement((previous) => ({
      ...previous,
      seats: [
        ...previous.seats,
        {
          id: `seat-${Date.now()}`,
          name: newSeat.name.trim(),
          email: newSeat.email.trim(),
          role: newSeat.role,
          team: newSeat.team.trim() || 'General',
          status: 'pending',
        },
      ],
    }));

    setNewSeat({
      name: '',
      email: '',
      role: 'manager',
      team: '',
    });
  };

  const allocatedCount = seatManagement.seats.filter((seat) => seat.status === 'allocated').length;
  const pendingCount = seatManagement.seats.filter((seat) => seat.status === 'pending').length;
  const availableCount = Math.max(0, seatManagement.totalSeats - allocatedCount);

  const updateSeat = (id: string, patch: Partial<SeatAssignment>) => {
    setSeatManagement((previous) => ({
      ...previous,
      seats: previous.seats.map((seat) => (seat.id === id ? { ...seat, ...patch } : seat)),
    }));
  };

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Org admin"
        title="Allocate seats, set reviewer ownership, and keep the workspace ready for the quarter"
        description="This is the organization-level admin surface. Owners and admins can assign seats to teams, track who is live, and keep the reporting workspace clean without touching super-admin controls."
        points={[
          {
            title: 'Allocate seats',
            detail: 'Add reviewers, approvers, and contributors by team so the right people see the right work.',
          },
          {
            title: 'Track usage',
            detail: 'Watch allocated, pending, and available seats so the subscription stays in sync with reality.',
          },
          {
            title: 'Keep it guided',
            detail: 'Every block on this page explains the next action so non-technical users can self-serve confidently.',
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
                <p className="mt-2 text-2xl font-semibold">{seatManagement.planName}</p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Allocated seats</p>
                <p className="mt-2 text-2xl font-semibold">{allocatedCount}</p>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Available</p>
                <p className="mt-2 text-2xl font-semibold">{availableCount}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader>
            <CardTitle>Seat allocation</CardTitle>
            <CardDescription>Assign seats to the people who actually review ESG data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="seat-name">Name</Label>
                <Input
                  id="seat-name"
                  value={newSeat.name}
                  onChange={(event) => setNewSeat((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Reviewer name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="seat-email">Email</Label>
                <Input
                  id="seat-email"
                  value={newSeat.email}
                  onChange={(event) => setNewSeat((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder="reviewer@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newSeat.role} onValueChange={(value) => setNewSeat((previous) => ({ ...previous, role: value as OrgRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input
                  value={newSeat.team}
                  onChange={(event) => setNewSeat((previous) => ({ ...previous, team: event.target.value }))}
                  placeholder="Sustainability"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full rounded-2xl" onClick={addSeat}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add seat
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {seatManagement.seats.map((seat) => (
                <div key={seat.id} className="grid gap-3 rounded-2xl bg-muted/35 px-4 py-4 md:grid-cols-[minmax(0,1fr)_180px_180px] md:items-center">
                  <div>
                    <p className="text-sm font-medium">{seat.name}</p>
                    <p className="text-xs text-muted-foreground">{seat.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select value={seat.role} onValueChange={(value) => updateSeat(seat.id, { role: value as OrgRole })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select value={seat.status} onValueChange={(value) => updateSeat(seat.id, { status: value as SeatStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Badge variant="secondary" className="rounded-full">
                      {seat.team}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[1.8rem] border-white/70 bg-[#f5f7f7]/90 shadow-none">
            <CardHeader>
              <CardTitle>Seat guidance</CardTitle>
              <CardDescription>What each admin block should be used for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-medium">1. Allocate reviewers</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">Assign the people who own daily and weekly ESG data collection.</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-medium">2. Keep access current</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">Move people to pending or unassigned when they rotate out of the reporting cycle.</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-medium">3. Save the settings</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">Persist the team model to tenant settings so the workspace remembers it.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
            <CardHeader>
              <CardTitle>Advanced settings</CardTitle>
              <CardDescription>Raw JSON remains available for operators who need to tweak the tenant record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading settings...</p>
              ) : isError ? (
                <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'Failed to load settings'}</p>
              ) : (
                <>
                  <Textarea
                    className="min-h-[220px] font-mono text-xs"
                    value={settingsText}
                    onChange={(event) => setSettingsText(event.target.value)}
                  />
                  <div className="rounded-2xl bg-muted/35 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{seatManagement.notes}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Signed in as {user?.role ?? 'member'} · settings persist per tenant.
                    </div>
                    <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-full">
                      <Save className="mr-2 h-4 w-4" />
                      {updateMutation.isPending ? 'Saving...' : 'Save settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

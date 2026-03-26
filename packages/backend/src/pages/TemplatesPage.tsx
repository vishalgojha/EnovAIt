import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { adminApi } from '@/lib/api/endpoints';
import { Template } from '@/types';
import { cn } from '@/lib/utils';

export function TemplatesPage() {
  const [search, setSearch] = React.useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: adminApi.getTemplates,
    initialData: [
      { id: 't1', module_id: 'm1', name: 'ESG Monthly Intake', schema: { facility_name: 'string' }, question_flow: [{ id: 'facility_name', question: 'Facility?' }], is_default: true, is_active: true },
      { id: 't2', module_id: 'm2', name: 'Maintenance Intake', schema: { severity: 'string' }, question_flow: [{ id: 'severity', question: 'Severity?' }], is_default: false, is_active: true },
    ] as Template[],
  });

  const filteredTemplates = templates?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.module_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Create and manage message templates for all communication channels.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates?.map((template) => {
          const Icon = FileText;
          const schemaPreview = JSON.stringify(template.schema);
          const variableKeys = Object.keys(template.schema ?? {});
          return (
            <Card key={template.id} className="group hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  template.is_default ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
                )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                <CardDescription className="text-xs uppercase font-semibold">module: {template.module_id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded p-3 text-xs font-mono text-muted-foreground line-clamp-3 min-h-[60px]">
                  {schemaPreview}
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {variableKeys.map(v => (
                    <Badge key={v} variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
                      {v}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center text-[10px] text-muted-foreground">
                <span>ID: {template.id}</span>
                <span>Last updated 2d ago</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

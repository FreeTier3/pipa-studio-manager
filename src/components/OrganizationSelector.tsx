
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDatabase } from "@/hooks/useDatabase";

interface OrganizationSelectorProps {
  currentOrganization: number;
  onOrganizationChange: (organizationId: number) => void;
}

export const OrganizationSelector = ({ currentOrganization, onOrganizationChange }: OrganizationSelectorProps) => {
  const { getOrganizations } = useDatabase();
  const organizations = getOrganizations();

  return (
    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block">📂 Organização</label>
      <Select 
        value={currentOrganization.toString()} 
        onValueChange={(value) => onOrganizationChange(Number(value))}
      >
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

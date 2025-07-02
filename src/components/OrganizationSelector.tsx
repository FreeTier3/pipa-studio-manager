
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";

interface OrganizationSelectorProps {
  currentOrganization: number;
  onOrganizationChange: (organizationId: number) => void;
}

export const OrganizationSelector = ({ currentOrganization, onOrganizationChange }: OrganizationSelectorProps) => {
  const { getOrganizations } = useDatabase();
  const organizations = getOrganizations();
  const currentOrg = organizations.find(org => org.id === currentOrganization);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-500" />
      <Select 
        value={currentOrganization.toString()} 
        onValueChange={(value) => onOrganizationChange(Number(value))}
      >
        <SelectTrigger className="w-48 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
          <SelectValue>
            {currentOrg?.name || "Selecionar organização"}
          </SelectValue>
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

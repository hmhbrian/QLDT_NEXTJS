import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

import { services, departmentsService } from "@/lib";
import type { ServiceDepartment } from "@/lib/types/department.types";

const ExampleComponent = () => {
  const [departments, setDepartments] = React.useState<ServiceDepartment[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await departmentsService.getDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="departments">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <div className="space-y-4">
              <Label htmlFor="search">Search Departments</Label>
              <Input id="search" placeholder="Search..." />

              <div className="mt-4">
                {departments.map((dept) => (
                  <div
                    key={dept.departmentId}
                    className="p-2 border rounded mb-2"
                  >
                    {dept.name}
                  </div>
                ))}
              </div>

              <Button variant="default">Add Department</Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <Label htmlFor="name">Settings Name</Label>
              <Input id="name" />

              <Button variant="default">Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExampleComponent;

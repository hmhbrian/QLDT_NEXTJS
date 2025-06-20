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

import apiServices, { departmentsService } from "@/lib/services";
import { DepartmentInfo } from "@/lib/types";

const ExampleComponent = () => {
  const [departments, setDepartments] = React.useState<DepartmentInfo[]>([]);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsTree =
          await departmentsService.getDepartmentsTree();
        setDepartments(departmentsTree);
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
                  <div key={dept.id} className="p-2 border rounded mb-2">
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

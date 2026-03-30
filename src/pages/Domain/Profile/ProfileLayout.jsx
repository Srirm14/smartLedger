import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useUserProfileDetails from "../../../../store/useUserProfileDetails";

const ProfilePage = () => {
  const { userDetails, fetchUserDetails, loading, error } =
    useUserProfileDetails();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    organization: "",
    role: "Admin",
    email: "",
  });

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userDetails) {
      const orgRaw = userDetails.organisation;
      const organizationName =
        typeof orgRaw === "string"
          ? orgRaw
          : orgRaw?.name ?? userDetails.organisation_name ?? "";
      setProfileData({
        organization: organizationName || "N/A",
        role: "Admin",
        email: userDetails.email || "N/A",
      });
    }
  }, [userDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
  };

  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8 pt-12">
        <Card className="bg-white shadow-none border-none rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-none pb-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-gray-900">My Profile</CardTitle>
              {/* {!isEditingProfile && (
                <Button variant="ghost" onClick={() => setIsEditingProfile(true)} className="gap-2">
                  <Edit className="h-4 w-4" /> Edit Profile
                </Button>
              )} */}
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            <div className="grid grid-cols-[180px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-gray-600">Organization</label>
              {loading ? (
                <Skeleton className="h-6 w-full" />
              ) : isEditingProfile ? (
                <Input
                  name="organization"
                  value={profileData.organization}
                  onChange={handleInputChange}
                  className="border-gray-200"
                />
              ) : (
                <p className="text-base text-gray-900">
                  {profileData.organization.replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-[180px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-gray-600">Role</label>
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <Badge
                    variant="secondary"
                    className="border-[1.2px] border-gray-900/10 bg-gray-100 text-gray-900 px-3 py-1"
                  >
                    {profileData.role}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-gray-600">Email</label>
              {loading ? (
                <Skeleton className="h-6 w-full" />
              ) : isEditingProfile ? (
                <Input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="border-gray-200"
                />
              ) : (
                <p className="text-base text-gray-900">{profileData.email}</p>
              )}
            </div>
          </CardContent>

          {isEditingProfile && (
            <CardFooter className="flex justify-end gap-2 border-t bg-gray-50/50 p-6">
              <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

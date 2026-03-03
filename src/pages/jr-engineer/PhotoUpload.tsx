import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { constructionPhotosApi } from "@/api/constructionService";
import { usePhotosSWR, useProjectsSWR, invalidatePhotos } from "@/hooks/useConstructionSWR";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const PhotoUpload = () => {
  const { results: photos, isLoading } = usePhotosSWR({ page_size: 50, ordering: "-created_at" });
  const { results: projects } = useProjectsSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gpsLat, setGpsLat] = useState<string>("");
  const [gpsLng, setGpsLng] = useState<string>("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-capture GPS on form open
  useEffect(() => {
    if (showForm && navigator.geolocation) {
      setGpsStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude.toFixed(6));
          setGpsLng(pos.coords.longitude.toFixed(6));
          setGpsStatus("success");
        },
        () => {
          setGpsStatus("error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [showForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!selectedProject || !selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("project", String(selectedProject));
      formData.append("photo", selectedFile);
      if (gpsLat) formData.append("latitude", gpsLat);
      if (gpsLng) formData.append("longitude", gpsLng);

      await constructionPhotosApi.upload(formData);
      toast.success("Photo uploaded successfully");
      resetForm();
      await invalidatePhotos();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setGpsLat("");
    setGpsLng("");
    setGpsStatus("idle");
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Upload</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload site photos with GPS location
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            Upload Photo
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">Upload Site Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <>
                    <Camera className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to select a photo or take one
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                GPS Location (auto-captured)
              </Label>
              <div className="flex items-center gap-2 text-sm">
                {gpsStatus === "loading" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-gray-500">Capturing GPS...</span>
                  </>
                )}
                {gpsStatus === "success" && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">
                      Lat: {gpsLat}, Lng: {gpsLng}
                    </span>
                  </>
                )}
                {gpsStatus === "error" && (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-700">
                      GPS unavailable. Photo will upload without location.
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedProject || !selectedFile}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No photos yet</p>
          <p className="text-sm">Upload your first site photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={photo.photo}
                  alt={photo.caption || "Site photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  {photo.is_geofence_violation ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Violation
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {photo.project_name || `Project #${photo.project}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
                {photo.latitude && photo.longitude && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    GPS: {Number(photo.latitude).toFixed(4)}, {Number(photo.longitude).toFixed(4)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

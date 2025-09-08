"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Upload, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type Thumbnail = {
  id: string;
  title: string;
  category: string;
  imageUrl: string; // This will now be a Base64 Data URI
  createdAt: Date;
};

const uploadSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  image: z.any().refine((files) => files?.length == 1, "Image is required."),
});

const categories = ["All", "Gaming", "Vlog", "Tutorial", "Lifestyle", "Tech", "Cooking", "Education"];

// Helper function to convert a file to a Base64 data URI
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export default function Home() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const q = query(collection(db, "thumbnails"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedThumbnails = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as Thumbnail));
        setThumbnails(fetchedThumbnails);
      } catch (error) {
        console.error("Error fetching thumbnails: ", error);
        toast({
            title: "Loading Failed",
            description: "Could not fetch thumbnails. Make sure Firestore is set up correctly.",
            variant: "destructive",
        });
      }
    };

    fetchThumbnails();
  }, [toast]);

  const fileRef = form.register("image");

  async function onSubmit(values: z.infer<typeof uploadSchema>) {
    const file = values.image[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Convert image to Base64 Data URI
      setUploadProgress(30);
      const imageDataUrl = await toBase64(file);
      setUploadProgress(60);

      // 2. Save thumbnail data to Firestore
      const newThumbnailData = {
        title: values.title,
        category: values.category,
        imageUrl: imageDataUrl,
        createdAt: new Date(),
      };
      
      setUploadProgress(80);
      const docRef = await addDoc(collection(db, "thumbnails"), newThumbnailData);
      
      const newThumbnail: Thumbnail = {
        id: docRef.id,
        ...newThumbnailData,
      };

      setThumbnails([newThumbnail, ...thumbnails]);
      setUploadProgress(100);

      toast({
        title: "Success!",
        description: `Thumbnail "${values.title}" has been added.`,
      });
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your thumbnail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const filteredThumbnails = useMemo(() => {
    return thumbnails
      .filter((thumb) => activeCategory === "All" || thumb.category === activeCategory)
      .filter((thumb) => thumb.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [thumbnails, activeCategory, searchTerm]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <h1 className="font-headline text-2xl font-bold text-foreground">
          Thumbnail <span className="text-primary">Zone</span>
        </h1>
        <div className="ml-auto flex items-center gap-4">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              form.reset();
              setImagePreview(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Upload Thumbnail
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload a new thumbnail</DialogTitle>
                <DialogDescription>
                  Add a new thumbnail to your collection. Enter the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., My Awesome Video" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.filter(c => c !== 'All').map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" {...fileRef} 
                           disabled={isUploading}
                           onChange={(e) => {
                              field.onChange(e.target.files);
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setImagePreview(e.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setImagePreview(null);
                              }
                           }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {imagePreview && !isUploading && (
                    <div className="relative mt-4 h-36 w-full">
                       <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                        <p className="text-sm text-center">Uploading...</p>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" disabled={isUploading}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Your Collection</h2>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search thumbnails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((category) => (
                    <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                    className="rounded-full transition-all"
                    >
                    {category}
                    </Button>
                ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredThumbnails.map((thumbnail) => (
            <Card key={thumbnail.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={thumbnail.imageUrl}
                    alt={thumbnail.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    data-ai-hint="youtube thumbnail"
                  />
                </div>
              </CardContent>
              <CardHeader className="p-4">
                <CardTitle className="truncate text-base font-bold transition-colors group-hover:text-primary">{thumbnail.title}</CardTitle>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                 <Badge variant="secondary">{thumbnail.category}</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>

        {thumbnails.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <h2 className="mb-2 text-2xl font-semibold">Loading Thumbnails...</h2>
                <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
        )}

        {thumbnails.length > 0 && filteredThumbnails.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <h2 className="mb-2 text-2xl font-semibold">No thumbnails found</h2>
                <p className="text-muted-foreground">Try adjusting your search or filters, or upload a new thumbnail.</p>
            </div>
        )}
      </main>
    </div>
  );
}

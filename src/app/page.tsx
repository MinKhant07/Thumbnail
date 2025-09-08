"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Upload, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

type Thumbnail = {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
};

const uploadSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
});

const initialThumbnails: Thumbnail[] = [
  { id: 1, title: "Epic Fortnite Montage", category: "Gaming", imageUrl: "https://picsum.photos/id/10/1280/720", },
  { id: 2, title: "My Trip to Japan", category: "Vlog", imageUrl: "https://picsum.photos/id/20/1280/720", },
  { id: 3, title: "React Hooks in 10 Minutes", category: "Tutorial", imageUrl: "https://picsum.photos/id/30/1280/720", },
  { id: 4, title: "Healthy Morning Routine", category: "Lifestyle", imageUrl: "https://picsum.photos/id/40/1280/720", },
  { id: 5, title: "Minecraft Survival Guide", category: "Gaming", imageUrl: "https://picsum.photos/id/50/1280/720", },
  { id: 6, title: "Unboxing the new MacBook", category: "Tech", imageUrl: "https://picsum.photos/id/60/1280/720", },
  { id: 7, title: "How to Cook Pasta", category: "Cooking", imageUrl: "https://picsum.photos/id/70/1280/720", },
  { id: 8, title: "The Philosophy of Stoicism", category: "Education", imageUrl: "https://picsum.photos/id/80/1280/720", },
];

const categories = ["All", "Gaming", "Vlog", "Tutorial", "Lifestyle", "Tech", "Cooking", "Education"];

export default function Home() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>(initialThumbnails);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    const newThumbnail: Thumbnail = {
      id: thumbnails.length + 1,
      ...values,
    };
    setThumbnails([newThumbnail, ...thumbnails]);
    toast({
      title: "Success!",
      description: `Thumbnail "${values.title}" has been added.`,
    });
    setIsDialogOpen(false);
    form.reset();
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                          <Input placeholder="e.g., My Awesome Video" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://picsum.photos/1280/720" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Upload</Button>
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

        {filteredThumbnails.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <h2 className="mb-2 text-2xl font-semibold">No thumbnails found</h2>
                <p className="text-muted-foreground">Try adjusting your search or filters, or upload a new thumbnail.</p>
            </div>
        )}
      </main>
    </div>
  );
}

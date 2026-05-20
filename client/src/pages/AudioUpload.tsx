import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, Play, Pause, Volume2, Music } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface AudioFile {
  id: number;
  title: string;
  description: string | null;
  audioUrl: string;
  duration: number | null;
  audioType: string | null;
  createdAt: Date;
}

export default function AudioUpload() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioType, setAudioType] = useState<"meditation" | "session_recording" | "personal_note" | "other">("meditation");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createAudioMutation = trpc.audioFiles.create.useMutation();
  const listAudioQuery = trpc.audioFiles.listByTherapist.useQuery();

  const audioFiles: AudioFile[] = listAudioQuery.data || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast.error("Por favor, selecione um arquivo de áudio");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 50MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast.error("Preencha o título e selecione um arquivo");
      return;
    }

    setIsUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const audioBuffer = base64.split(",")[1];

          // Upload to server (which will use storagePut)
          const response = await fetch("/api/trpc/audioFiles.create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              description,
              audioType,
              fileData: audioBuffer,
              fileName: selectedFile.name,
            }),
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          toast.success("Áudio enviado com sucesso!");
          setTitle("");
          setDescription("");
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Refetch audio list
          listAudioQuery.refetch();
        } catch (error) {
          toast.error("Erro ao enviar áudio");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      console.error(error);
      setIsUploading(false);
    }
  };

  const togglePlayPause = (id: number, audioUrl: string) => {
    if (playingId === id) {
      const audio = audioRefs.current[id];
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    } else {
      // Stop other audio
      Object.values(audioRefs.current).forEach(audio => audio.pause());

      // Play new audio
      if (!audioRefs.current[id]) {
        const audio = new Audio(audioUrl);
        audioRefs.current[id] = audio;
      }
      audioRefs.current[id].volume = volume;
      audioRefs.current[id].play();
      setPlayingId(id);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">
            Biblioteca de Áudios
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <Card className="lg:col-span-1 bg-slate-50 border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Enviar Áudio
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título *
                  </label>
                  <Input
                    placeholder="Ex: Meditação da Manhã"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    placeholder="Descrição do áudio..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={audioType}
                    onChange={(e) => setAudioType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="meditation">Meditação</option>
                    <option value="session_recording">Gravação de Sessão</option>
                    <option value="personal_note">Nota Pessoal</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Arquivo de Áudio *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-400 transition">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        {selectedFile ? selectedFile.name : "Clique para selecionar"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Máximo 50MB
                      </p>
                    </button>
                  </div>
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !title}
                  className="w-full bg-gradient-to-r from-[hsl(var(--spiritual-gold))] to-[hsl(var(--spiritual-lilac))] text-slate-900 hover:shadow-spiritual"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Áudio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Audio List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Meus Áudios
            </h2>

            {audioFiles.length === 0 ? (
              <Card className="bg-slate-50 border border-slate-200 p-8 text-center">
                <Music className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">
                  Nenhum áudio enviado ainda. Comece a enviar áudios!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {audioFiles.map((audio) => (
                  <Card key={audio.id} className="bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {audio.title}
                        </h3>
                        {audio.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {audio.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span className="px-2 py-1 bg-slate-200 rounded">
                            {audio.audioType}
                          </span>
                          {audio.duration && (
                            <span>{formatDuration(audio.duration)}</span>
                          )}
                        </div>
                      </div>

                      {/* Player Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePlayPause(audio.id, audio.audioUrl)}
                          className="border-slate-300"
                        >
                          {playingId === audio.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 ml-2">
                          <Volume2 className="w-4 h-4 text-slate-600" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => {
                              const newVolume = parseFloat(e.target.value);
                              setVolume(newVolume);
                              Object.values(audioRefs.current).forEach(
                                (audio) => (audio.volume = newVolume)
                              );
                            }}
                            className="w-16"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

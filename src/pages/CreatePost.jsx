import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { createPost } from "../services/postService";
import "./CreatePost.css";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);
const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "mp4",
  "mov",
  "webm",
  "m4v",
]);

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [rawImageName, setRawImageName] = useState("image.jpg");
  const [rawImageType, setRawImageType] = useState("image/jpeg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (error) => reject(error));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });

  const getCroppedBlob = async (imageSrc, pixelCrop, type) => {
    const imageElement = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    context.drawImage(
      imageElement,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not crop image"));
            return;
          }

          resolve(blob);
        },
        type || "image/jpeg",
        0.95
      );
    });
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!rawImageSrc || !croppedAreaPixels) {
      setShowCropper(false);
      return;
    }

    try {
      const croppedBlob = await getCroppedBlob(rawImageSrc, croppedAreaPixels, rawImageType);
      const croppedFile = new File([croppedBlob], rawImageName, {
        type: croppedBlob.type || rawImageType,
      });

      setImage(croppedFile);
      setPreview(URL.createObjectURL(croppedFile));
      setPreviewType("image");
      setShowCropper(false);
      setRawImageSrc("");
    } catch {
      alert("Failed to crop image. Please try again.");
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setRawImageSrc("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImage(null);
      setPreview("");
      setPreviewType("image");
      return;
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const isAllowedType = ALLOWED_IMAGE_TYPES.has((file.type || "").toLowerCase());
    const isAllowedExtension = ALLOWED_EXTENSIONS.has(ext);

    if (!isAllowedType && !isAllowedExtension) {
      alert("Unsupported format. Use JPG, JPEG, PNG, WEBP, MP4, MOV, WEBM, or M4V.");
      e.target.value = "";
      setImage(null);
      setPreview("");
      setPreviewType("image");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("File too large. Maximum allowed size is 15MB.");
      e.target.value = "";
      setImage(null);
      setPreview("");
      setPreviewType("image");
      return;
    }

    const isVideo = (file.type || "").startsWith("video/");
    if (isVideo) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPreviewType("video");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setRawImageName(file.name || "image.jpg");
    setRawImageType(file.type || "image/jpeg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCropper(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      await createPost(formData);
      alert("Post uploaded successfully.");
      setCaption("");
      setImage(null);
      setPreview("");
      setPreviewType("image");
    } catch (err) {
      alert(err.response?.data?.message || "Upload Failed");
    }
  };

  return (
    <div className="create-page">
      {showCropper ? (
        <div className="cropper-overlay" onClick={handleCancelCrop}>
          <div
            className="cropper-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3>Crop Image</h3>
            <div className="cropper-wrap">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>

            <div className="cropper-controls">
              <label htmlFor="zoomRange">Zoom</label>
              <input
                id="zoomRange"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className="cropper-actions">
              <button type="button" className="cropper-cancel" onClick={handleCancelCrop}>
                Cancel
              </button>
              <button type="button" className="cropper-apply" onClick={handleApplyCrop}>
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form className="create-card" onSubmit={handleSubmit}>
        <h2>Create New Post</h2>

        {preview ? (
          previewType === "video" ? (
            <video src={preview} className="preview" controls />
          ) : (
            <img src={preview} alt="" className="preview" />
          )
        ) : null}

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.m4v"
          onChange={handleImage}
          required
        />

        <textarea
          placeholder="Write your caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows="5"
          required
        />

        <button type="submit">Upload Post</button>
      </form>
    </div>
  );
}

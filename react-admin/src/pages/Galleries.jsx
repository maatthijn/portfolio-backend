import { useOutletContext } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../css/Galleries.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Galleries() {
    // Variables
    const { handleNavClick } = useOutletContext();
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isFadeInActive, setIsFadeInActive] = useState(false);
    const [modalRender, setModalRender] = useState(false);
    const [imageEdit, setImageEdit] = useState(false);
    const [imageData, setImageData] = useState([]);
    const [originalImageData, setOriginalImageData] = useState([]);

    const [imageName, setImageName] = useState("");
    const [imageDescription, setImageDescription] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [textareaValue, setTextareaValue] = useState("");

    // Mobile checking
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [disableClicks, setDisableClicks] = useState(isMobile);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Clean up listener on unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Image section
    const [images, setImages] = useState([]);
    const [previewURL, setPreviewURL] = useState(null);

    useEffect(() => {
        if (images.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const targets = document.querySelectorAll(".img-image");
        targets.forEach((img) => observer.observe(img));

        return () => {
            observer.disconnect();
        };
    }, [images]);

    const fetchImages = async () => {
        try {
            const response = await fetch("/api/galleries");
            const data = await response.json();
            setImages(data);
        } catch (error) {
            console.error("Failed to fetch images:", error);
        }
    };

    useEffect(() => {
        document.title = "Galleries | HAFIDH MAULANA MATIN";
        fetchImages();
    }, []);

    // Alert
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success"); // or "danger", "warning", etc.
    const [showAlert, setShowAlert] = useState(false);

    const showBootstrapAlert = (message, type = "success") => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false);
        }, 4000);
    };

    // Modal section
    const modalRef = useRef(null);
    const bodyRef = useRef(null);
    const delModalRef = useRef(null);

    const handleImageClick = async () => {
        setDisableClicks(true);
        await new Promise((res) => setTimeout(res, 100));
        setDisableClicks(false);
    }

    const handleImageModal = (src) => {
        setModalRender(true);
        setIsFadingOut(false);
        if (isMobile) {setDisableClicks(true)};
        if (Array.isArray(src) && src.length === 0) {
            setImageEdit(false);
            setImageData(null);
            setOriginalImageData(null);

            setImageName("");
            setImageDescription([]);
            setTextareaValue("");
            setImageFile(null);
            setPreviewURL(null);
        } else {
            setImageEdit(true);
            setImageData(src);
            setOriginalImageData(src);

            setImageName(src.name || "");
            setImageDescription(src.description || []);
            setTextareaValue(
                Array.isArray(src.description)
                    ? src.description.join("\n\n")
                    : (src.description || "")
            );
        };

        setTimeout(() => {
            setIsFadeInActive(true);
        }, 1);
    };

    useEffect(() => {
        if (imageData) {
            setImageName(imageData.name);
            setImageDescription(imageData.description);
            setTextareaValue(
                Array.isArray(imageData.description)
                    ? imageData.description.join("\n\n")
                    : (imageData.description || "")
            );
        } else {
            setImageName("");
            setImageDescription([]);
            setTextareaValue("");
        }
    }, [imageData]);

    // Avoid unchanged content saving
    const isContentUnchanged = () => {
        if (!originalImageData) return false;

        const originalDesc = Array.isArray(originalImageData.description)
            ? originalImageData.description.join("\n\n")
            : (originalImageData.description || "");

        return (
            imageName === originalImageData.name &&
            textareaValue.trim() === originalDesc.trim()
        );
    };

    // Modal close button
    const closeModal = () => {
        setIsFadingOut(true);
        setIsFadeInActive(false);
        if (isMobile) {setDisableClicks(true)};
        setTimeout(() => {
            setModalRender(false);
        }, 600);
    };

    // Handle Image Submit and Draft
    const handleImageSubmit = async (publishStatus, e) => {
        e.preventDefault()
        const cleanedDescription = textareaValue
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        setImageDescription(cleanedDescription); // optional, for syncing state

        const formData = new FormData();
        formData.append("name", imageName);
        formData.append("description", cleanedDescription); // if it's an array
        formData.append("published", publishStatus);
        if (!imageEdit && imageFile) {
            formData.append("image", imageFile);
        }

        if (!imageEdit) {
            try {
                const res = await fetch("/api/galleries", {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    showBootstrapAlert("Session expired. Please log in again.", "danger");
                    return;
                }

                if (res.ok) {
                    showBootstrapAlert(publishStatus ? "Image is uploaded successfully!" : "Image is saved to draft.", "success");
                    setTimeout(() => {
                        setImageName("");
                        setImageDescription([]);
                    }, 1000);
                    fetchImages();
                    closeModal();
                } else {
                    showBootstrapAlert(data.message || "Failed to process image.", "danger");
                }
            } catch (err) {
                console.error(err);
                showBootstrapAlert("An error occurred while processing the image.", "danger");
            }

        } else {
            try {
                const url = imageData
                    ? `/api/galleries/${imageData._id}`
                    : `/api/galleries`;

                const method = imageData ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    showBootstrapAlert("Session expired. Please log in again.", "danger");
                    return;
                }

                if (res.ok) {
                    showBootstrapAlert(publishStatus ? "Image is uploaded successfully!" : "Image is saved to draft.", "success");
                    setTimeout(() => {
                        setImageName("");
                        setImageDescription([]);
                    }, 1000);
                    fetchImages();
                    closeModal();
                } else {
                    showBootstrapAlert(data.message || "Failed to process image.", "danger");
                }
            } catch (err) {
                console.error(err);
                showBootstrapAlert("An error occurred while processing the image.", "danger");
            }
        };
    };

    // Deleting Image
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [isDelFadingOut, setIsDelFadingOut] = useState(false);
    const [isDelFadeInActive, setIsDelFadeInActive] = useState(false);

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setShowDeleteModal(true);
        setIsDelFadingOut(false);
        setTimeout(() => {
            setIsDelFadeInActive(true);
        }, 1);
    };

    const closeDeleteClick = () => {
        setIsDelFadingOut(true);
        setIsDelFadeInActive(false);
        setTimeout(() => {
            setShowDeleteModal(false);
        }, 600);
    }

    // Image Input
    function CustomFileInput({ onFileSelect, onPreviewLoad }) {
        const fileInputRef = useRef();
        const [fileName, setFileName] = useState("");

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setFileName(file.name);
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    onPreviewLoad(reader.result);
                };
                reader.readAsDataURL(file);
                onFileSelect(file);
            }
        };

        return (

            <>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="d-none"
                    accept="image/*"
                />
                {imageFile && (<div className="mt-2 text-success">Ready to upload: <strong>{imageFile.name}</strong></div>)}
                <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                >
                    {fileName || "Choose File"}
                </button>
            </>
        );
    }

    // Avoid Scrolling
    useEffect(() => {
        const html = document.documentElement;
        if (modalRender) {
            html.style.overflow = 'hidden';
            html.style.paddingRight = '15px';
        } else {
            html.style.overflow = '';
            html.style.paddingRight = '';
        }
        return () => {
            html.style.overflow = '';
            html.style.paddingRight = '';
        };
    }, [modalRender]);

    // Structures
    return (
        <>
            <div
                id="galleries-content"
                className="page-root contents d-flex flex-column min-vh-100 min-vw-100 justify-content-center align-items-center"
                ref={bodyRef}
            >
                <h1 id="galleries-salut" className="display-6 text-uppercase seq-anim">Galleries Maintenance</h1>
                <div className="seq-anim image-container">
                    <p className="seq-anim" id="galleries-instruction" translate="yes">Here, you can add a new image or maintain your current galleries, either edit or even delete it.</p>
                    <div className="seq-anim">
                        <div id="galleries-create-new">
                            <button
                                onClick={() => { handleImageModal([]) }}
                                onContextMenu={(e) => e.preventDefault()}
                            >Add an Image</button>
                        </div>
                        <div className="masonry seq-anim">
                            {images.map((image, index) => (
                                <div key={index} className="img-hover-zoom">
                                    <div
                                        className="img-container"
                                        onClick={isMobile ? handleImageClick : null}
                                    >
                                        <img
                                            key={index}
                                            src={image.url}
                                            alt={image.name || `img-${index}`}
                                            loading="lazy"
                                            className="shadow-1-strong rounded mb-4 img-image"
                                            style={{ pointerEvents: "none" }}
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                        <div className="img-draft-action">
                                            {!image.published ? <><h1 className="image-draft-label">Draft</h1></> : <></>}
                                            <div className="img-actions">
                                                <i
                                                    className="bi bi-pencil-fill"
                                                    title={`Edit "${image.name}"`}
                                                    onClick={() => {
                                                        if (!disableClicks) {
                                                            handleImageModal(image);
                                                        }
                                                    }}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    style={{ pointerEvents: disableClicks ? "none !important" : "auto" }}
                                                ></i>
                                                <i
                                                    className="bi bi-trash3-fill"
                                                    title={`Delete "${image.name}"`}
                                                    onClick={() => {
                                                        if (!disableClicks) {
                                                            handleDeleteClick(image)
                                                        }
                                                    }}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                ></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="seq-anim" onClick={(e) => handleNavClick(e, '/menu')}>Back</button>
                </div>
            </div>

            {/** Modal */}
            {modalRender && (
                <div
                    ref={modalRef}
                    className={`modal custom-modal ${isFadingOut ? "fade-out-modal" : isFadeInActive ? "fade-in-modal" : ""}`}
                >
                    <span className="close" id="image-close" onClick={closeModal}>
                        &times;
                    </span>
                    <div className="image-container image-maintenance-container">
                        <p>{`${imageEdit ? "Edit an Image" : "Add an Image"}`}</p>
                        <form id="image-form">
                            {!imageEdit &&
                                <div className="image-form-content image-pic-input">
                                    {/** 
                                    <input
                                        id="image-maintenance-upload"
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        required />
                                    */}
                                    {previewURL && (
                                        <div className="text-center mt-3">
                                            <img
                                                src={previewURL}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: "12rem",
                                                    maxHeight: "12rem",
                                                    objectFit: "cover",
                                                    pointerEvents: "none"
                                                }}
                                            />
                                        </div>
                                    )}
                                    <CustomFileInput onFileSelect={setImageFile} onPreviewLoad={setPreviewURL} />
                                </div>
                            }
                            <div className="image-form-content">
                                <input
                                    id="image-maintenance-name"
                                    type="text"
                                    name="name"
                                    placeholder="Image Title"
                                    autoComplete="off"
                                    value={imageName || ""}
                                    onChange={(e) => setImageName(e.target.value)}
                                    required >
                                </input>
                            </div>
                            {imageDescription &&
                                <div className="image-form-content">
                                    <textarea
                                        id="image-maintenance-content"
                                        name="description"
                                        placeholder="Description"
                                        autoComplete="off"
                                        value={textareaValue}
                                        onChange={(e) => setTextareaValue(e.target.value)}
                                        rows={6}
                                        required
                                    />
                                </div>}

                            <div className="modal-set-button">
                                <button
                                    type="button"
                                    id="image-maintenance-draft"
                                    onClick={(e) => handleImageSubmit(false, e)}
                                >
                                    Save as Draft
                                </button>

                                {(!isContentUnchanged() || !originalImageData?.published) &&
                                    <button
                                        type="submit"
                                        id="image-maintenance-submit"
                                        onClick={(e) => handleImageSubmit(true, e)}
                                    >
                                        Upload
                                    </button>
                                }
                            </ div>

                        </form>

                    </div>
                </div>
            )}

            {/** Deleting Image Modal */}
            {showDeleteModal && (
                <div
                    ref={delModalRef}
                    className={`modal custom-modal ${isDelFadingOut ? "fade-out-modal" : isDelFadeInActive ? "fade-in-modal" : ""}`}
                >
                    <div className="image-container image-maintenance-container">
                        <p>Are you sure you want to delete "<strong>{imageToDelete.name}</strong>"?</p>
                        <div className="d-flex gap-2 mt-3 justify-content-center">
                            <button
                                className="btn btn-danger delete-button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`/api/galleries/${imageToDelete._id}?public_id=${encodeURIComponent(imageToDelete.public_id)}`, {
                                            method: "DELETE",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                        });

                                        if (res.status === 401 || res.status === 403) {
                                            localStorage.removeItem("token");
                                            showBootstrapAlert("Session expired. Please log in again.", "danger");
                                            return;
                                        }

                                        if (res.ok) {
                                            showBootstrapAlert("Image deleted successfully!", "success");
                                            setShowDeleteModal(false);
                                        } else {
                                            showBootstrapAlert("Failed to delete the image.", "danger");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        showBootstrapAlert("An error occurred while deleting.", "danger");
                                    }
                                    fetchImages();
                                    closeDeleteClick();
                                }}
                            >
                                Yes, Delete
                            </button>
                            <button className="btn btn-secondary" onClick={() => closeDeleteClick()}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/** Alert */}
            {showAlert && (
                <div className={`alert alert-${alertType} alert-dismissible show position-fixed top-25 start-50 translate-middle custom-alert`} role="alert">
                    {alertMessage}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowAlert(false)}
                    ></button>
                </div>
            )}
        </>
    )
}
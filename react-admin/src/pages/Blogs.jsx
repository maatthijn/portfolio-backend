import { useOutletContext } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Table from 'react-bootstrap/Table';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import dayjs from "dayjs";
import "../css/Blogs.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Blogs() {
    const { handleNavClick } = useOutletContext();

    // Alert
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success"); // or "danger", "warning", etc.
    const [showAlert, setShowAlert] = useState(false);

    const showBootstrapAlert = (message, type = "success") => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            setShowAlert(false);
        }, 4000);
    };

    // Modal section
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isFadeInActive, setIsFadeInActive] = useState(false);
    const [modalRender, setModalRender] = useState(false);
    const [disableClicks, setDisableClicks] = useState(false);
    const [blogEdit, setBlogEdit] = useState(false);
    const [blogData, setBlogData] = useState([]);
    const [originalBlogData, setOriginalBlogData] = useState([]);

    const [blogTitle, setBlogTitle] = useState("");
    const [blogAuthor, setBlogAuthor] = useState("");
    const [blogParagraphs, setBlogParagraphs] = useState([]);
    const [textareaValue, setTextareaValue] = useState("");

    const modalRef = useRef(null);
    const bodyRef = useRef(null);
    const delModalRef = useRef(null);

    const handleModalClick = (src) => {
        setModalRender(true);
        setDisableClicks(true);
        setIsFadingOut(false);
        if (Array.isArray(src) && src.length === 0) {
            setBlogEdit(false);
            setBlogData(null);
            setOriginalBlogData(null);

            setBlogTitle("");
            setBlogAuthor("");
            setBlogParagraphs([]);
            setTextareaValue("");
        } else {
            setBlogEdit(true);
            setBlogData(src);
            setOriginalBlogData(src);

            setBlogTitle(src.title || "");
            setBlogAuthor(src.author || "");
            setBlogParagraphs(src.paragraphs || []);
            setTextareaValue((src.paragraphs || []).join("\n\n"));
        };

        setTimeout(() => {
            setIsFadeInActive(true);
        }, 1);
    };

    useEffect(() => {
        if (blogData) {
            setBlogTitle(blogData.title);
            setBlogAuthor(blogData.author);
            setBlogParagraphs(blogData.paragraphs);
            setTextareaValue((blogData.paragraphs || []).join("\n\n"));
        } else {
            setBlogTitle("");
            setBlogAuthor("");
            setBlogParagraphs([]);
            setTextareaValue("");
        }
    }, [blogData]);

    // Avoid unchanged content saving
    const isContentUnchanged = () => {
        if (!originalBlogData) return false;

        return (
            blogTitle === originalBlogData.title &&
            blogAuthor === originalBlogData.author &&
            textareaValue.trim() === (originalBlogData.paragraphs || []).join("\n\n").trim()
        )
    }

    // Modal close button
    const closeModal = () => {
        setIsFadingOut(true);
        setIsFadeInActive(false);
        setTimeout(() => {
            setModalRender(false);
            setDisableClicks(false);
        }, 600);
    };

    // Blog fetching section
    function estimateReadingTime(paragraphs) {
        const text = paragraphs.join(" ");
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 250);
        return { wordCount, readingTime };
    }

    function sortBlogsByDate(data) {
        return Object.entries(data).sort(
            (a, b) => new Date(b[1].datetime) - new Date(a[1].datetime)
        );
    }

    function formatBlogDate(dateString, includeTime = false) {
        const format = includeTime ? "MMM D YYYY, h:mm A" : "M / D / YYYY";
        return dayjs(dateString).format(format);
    }

    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);

    // FEtching blog after
    const fetchBlog = () => {
        fetch('/api/blogs')
            .then((res) => res.json())
            .then((data) => {
                const sorted = sortBlogsByDate(data);
                setBlogs(sorted);
            })
            .catch((err) => console.error("Failed to fetch blog data:", err));
    };

    useEffect(() => {
        document.title = "Blog | HAFIDH MAULANA MATIN";
        fetchBlog();
    }, [])

    // Offcanvas section
    const [show, setShow] = useState(false);
    const [offcanvasRender, setOffcanvasRender] = useState(false);

    const handleShow = () => {
        setOffcanvasRender(true);
        setTimeout(() => setShow(true), 10)
    };
    const handleClose = () => {
        setShow(false)
        setTimeout(() => setOffcanvasRender(false), 800);
    };

    useEffect(() => {
        const html = document.documentElement;
        if (offcanvasRender || modalRender) {
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
    }, [offcanvasRender, modalRender]);

    // Handle Blog Submit and Draft
    const handleBlogSubmit = async (publishStatus, e) => {
        e.preventDefault()
        const cleanedParagraphs = textareaValue
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        setBlogParagraphs(cleanedParagraphs); // optional, for syncing state

        const payload = {
            title: blogTitle,
            author: blogAuthor,
            paragraphs: cleanedParagraphs,
            published: publishStatus
        }

        if (!blogEdit) {
            try {
                const res = await fetch("/api/blogs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    showBootstrapAlert("Session expired. Please log in again.", "danger");
                    return;
                }

                if (res.ok) {
                    showBootstrapAlert(publishStatus ? "Blog published successfully!" : "Blog is saved to draft.", "success");
                    setTimeout(() => {
                        setBlogTitle("");
                        setBlogAuthor("");
                        setBlogParagraphs([]);
                    }, 1000);
                    fetchBlog();
                    closeModal();
                } else {
                    showBootstrapAlert(data.message || "Failed to process blog.", "danger");
                }
            } catch (err) {
                console.error(err);
                showBootstrapAlert("An error occurred while processing the blog.", "danger");
            }

        } else {
            try {
                const url = blogData
                    ? `/api/blogs/${blogData._id}`
                    : `/api/blogs`;

                const method = blogData ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    showBootstrapAlert("Session expired. Please log in again.", "danger");
                    return;
                }

                if (res.ok) {
                    showBootstrapAlert(publishStatus ? "Blog published successfully!" : "Blog is saved to draft.", "success");
                    setTimeout(() => {
                        setBlogTitle("");
                        setBlogAuthor("");
                        setBlogParagraphs([]);
                    }, 1000);
                    fetchBlog();
                    closeModal();
                } else {
                    showBootstrapAlert(data.message || "Failed to process blog.", "danger");
                }
            } catch (err) {
                console.error(err);
                showBootstrapAlert("An error occurred while processing the blog.", "danger");
            }
        };
    };

    // Deleting Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [isDelFadingOut, setIsDelFadingOut] = useState(false);
    const [isDelFadeInActive, setIsDelFadeInActive] = useState(false);

    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
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

    // Structures
    return (
        <>
            <div
                id="blog-content"
                className="page-root contents d-flex flex-column min-vh-100 min-vw-100 justify-content-center align-items-center"
                ref={bodyRef}
            >
                <h1 id="blog-salut" className="display-6 text-uppercase seq-anim">Blog Maintenance</h1>
                <div className="seq-anim blog-container">
                    <p className="seq-anim" id="blog-instruction" translate="yes">Here, you can add a new blog or maintain your current blogs, either edit it, delete it, or even view it.</p>
                    <div className="seq-anim">
                        <div id="blog-create-new">
                            <button
                                style={{
                                    pointerEvents: disableClicks ? "none" : "auto",
                                }}
                                onClick={() => { handleModalClick([]) }}
                                onContextMenu={(e) => e.preventDefault()}
                            >Create a Blog</button>
                        </div>
                        <div>
                            <Table striped variant="dark" className="blog-table">
                                <thead>
                                    <tr>
                                        <th>Date Created</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blogs.map(([key, blog]) => {
                                        const { readingTime } = estimateReadingTime(blog.paragraphs);
                                        return (
                                            <tr
                                                key={key}
                                                className="blog-row"
                                            >
                                                <td>{formatBlogDate(blog.datetime)}</td>
                                                <td className="blog-table-title">
                                                    {blog.published ? (blog.title) : (<><span className="pink-text">(Draft)</span> {blog.title}</>)}
                                                </td>
                                                <td>{blog.author}</td>
                                                <td>
                                                    <div className="d-none d-lg-flex gap-2 blog-maintain-option">
                                                        <i
                                                            className="bi bi-eye-fill"
                                                            data-bs-toggle="offcanvas"
                                                            data-bs-target="#demo"
                                                            onClick={() => { setSelectedBlog(blog); handleShow() }}
                                                            title={`View "${blog.title}"`}
                                                        ></i>
                                                        <i
                                                            className="bi bi-pencil-fill"
                                                            title={`Edit "${blog.title}"`}
                                                            style={{
                                                                pointerEvents: disableClicks ? "none" : "auto",
                                                            }}
                                                            onClick={() => { handleModalClick(blog) }}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        ></i>
                                                        <i
                                                            className="bi bi-trash3-fill"
                                                            title={`Delete "${blog.title}"`}
                                                            onClick={() => { handleDeleteClick(blog) }}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        ></i>
                                                    </div>

                                                    <div className="d-flex d-lg-none align-items-center">
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="dark" className="no-caret">
                                                                <i className="bi bi-gear-wide-connected"></i>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => { setSelectedBlog(blog); handleShow() }}>
                                                                    <i className="bi bi-eye-fill me-2"></i> View
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleModalClick(blog)}>
                                                                    <i className="bi bi-pencil-fill me-2"></i> Edit
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleDeleteClick(blog)}>
                                                                    <i className="bi bi-trash3-fill me-2 text-danger"></i> Delete
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <button className="seq-anim" onClick={(e) => handleNavClick(e, '/menu')}>Back</button>
                </div>
            </div>

            {/** Offcanvas */}
            {offcanvasRender &&
                <Offcanvas
                    variant="dark"
                    backdrop="static"
                    placement="end"
                    show={show}
                    onHide={handleClose}
                    className={`blog-offcanvas-end ${!show ? "fade-out" : ""}`}
                    id="demo"
                    translate="yes"
                >
                    <Offcanvas.Header className="blog-offcanvas-header">
                        <Offcanvas.Title id="blog-title">{selectedBlog.title}</Offcanvas.Title>
                        <h6 id="blog-meta">
                            By {selectedBlog.author} •{" "}
                            {dayjs(selectedBlog.datetime).format("MMM D YYYY, h:mm A")}
                        </h6>
                        <hr />
                        <span className="close" data-bs-dismiss="offcanvas" onClick={handleClose}>&times;</span>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="blog-offcanvas-body">
                        <div id="blog-para">
                            {selectedBlog.paragraphs.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            }

            {/** Modal */}
            {modalRender && (
                <div
                    ref={modalRef}
                    className={`modal custom-modal ${isFadingOut ? "fade-out-modal" : isFadeInActive ? "fade-in-modal" : ""}`}
                >
                    <span className="close" id="image-close" onClick={closeModal}>
                        &times;
                    </span>
                    <div className="blog-container blog-maintenance-container">
                        <p>{`${blogEdit ? "Edit a Blog" : "Create a Blog"}`}</p>
                        <form id="blog-form">
                            <div className="blog-form-content">
                                <input
                                    id="blog-maintenance-title"
                                    type="text"
                                    name="title"
                                    placeholder="Blog Title"
                                    autoComplete="off"
                                    value={blogTitle || ""}
                                    onChange={(e) => setBlogTitle(e.target.value)}
                                    required >
                                </input>
                            </div>
                            <div className="blog-form-content">
                                <input
                                    id="blog-maintenance-author"
                                    type="text"
                                    name="author"
                                    placeholder="Author"
                                    autoComplete="off"
                                    value={blogAuthor || ""}
                                    onChange={(e) => setBlogAuthor(e.target.value)}
                                    required />
                            </div>
                            {blogParagraphs &&
                                <div className="blog-form-content">
                                    <textarea
                                        id="blog-maintenance-content"
                                        name="content"
                                        placeholder="Blog Content"
                                        autoComplete="off"
                                        value={textareaValue}
                                        onChange={(e) => setTextareaValue(e.target.value)}
                                        rows={12}
                                        required
                                    />
                                </div>
                            }

                            <div className="modal-set-button">
                                <button
                                    type="button"
                                    id="blog-maintenance-draft"
                                    onClick={(e) => handleBlogSubmit(false, e)}
                                >
                                    Save as Draft
                                </button>

                                {(!isContentUnchanged() || !originalBlogData?.published) &&
                                    <button
                                        type="submit"
                                        id="blog-maintenance-submit"
                                        onClick={(e) => handleBlogSubmit(true, e)}
                                    >
                                        Publish Blog
                                    </button>
                                }
                            </ div>

                        </form>

                    </div>
                </div>
            )}

            {/** Deleting Blog Modal */}
            {showDeleteModal && (
                <div
                    ref={delModalRef}
                    className={`modal custom-modal ${isDelFadingOut ? "fade-out-modal" : isDelFadeInActive ? "fade-in-modal" : ""}`}
                >
                    <div className="blog-container blog-maintenance-container">
                        <p>Are you sure you want to delete "<strong>{blogToDelete.title}</strong>"?</p>
                        <div className="d-flex gap-2 mt-3 justify-content-center">
                            <button
                                className="btn btn-danger delete-button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`/api/blogs/${blogToDelete._id}`, {
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
                                            showBootstrapAlert("Blog deleted successfully!", "success");
                                            setShowDeleteModal(false);
                                        } else {
                                            showBootstrapAlert("Failed to delete the blog.", "danger");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        showBootstrapAlert("An error occurred while deleting.", "danger");
                                    }
                                    fetchBlog();
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
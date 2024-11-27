import React, { useRef, useState } from "react";
import "./index.scss";
import { Button, Dropdown, Image, message } from "antd";
import { Navigate } from "react-router-dom";
import {
  CloseOutlined,
  DeleteFilled,
  EditFilled,
  HeartFilled,
  HeartOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import { FaCircle, FaRegCommentDots } from "react-icons/fa";
import TextArea from "antd/es/input/TextArea";
import { ImGrin } from "react-icons/im";
import { BsCursorFill } from "react-icons/bs";
import SmallComment from "../SmallComment";
import { BiDotsHorizontal } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegImage } from "react-icons/fa";
import LikeAPI from "../../../../api/likeAPI";
import CommentAPI from "../../../../api/commentAPI";
import { useAuth } from "../../../../context/authContext";

function formatDate(createdAt) {
  // Parse input date string to Date object
  const createdDate = new Date(
    createdAt.split(" ")[0].split("-").reverse().join("-") +
      "T" +
      createdAt.split(" ")[1]
  );

  // Get the current date
  const currentDate = new Date();

  // Check if the created date is today
  const isToday =
    createdDate.getDate() === currentDate.getDate() &&
    createdDate.getMonth() === currentDate.getMonth() &&
    createdDate.getFullYear() === currentDate.getFullYear();

  if (isToday) {
    // Return only time if it's today
    return `${createdDate.getHours().toString().padStart(2, "0")}:${createdDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Return date in DD-MM-YYYY format if it's not today
    return `${createdDate.getDate().toString().padStart(2, "0")}-${(
      createdDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${createdDate.getFullYear()}`;
  }
}

function SmallPost(props) {
  const { onUpdatePost } = props;
  const { user } = useAuth();

  const [messageApi, contextHolder] = message.useMessage();

  const [post, setPost] = useState(props.post);
  const [isLike, setIsLike] = useState(post.hasLiked);
  const [comment, setComment] = useState("");
  const [isShowComment, setIsShowComment] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleNavigateEdit = () => {
    Navigate("/editpost", { state: { post, user } }); // Đường dẫn đến trang bạn muốn chuyển hướng
  };

  console.log(post);

  const onLike = () => {
    try {
      
      LikeAPI.LikePost(user.userId, post.id)
      setPost({
        ...post,
        likeNum: isLike ? post.likeNum - 1 : post.likeNum + 1,
      });

      setIsLike(!isLike);
    } catch (error) {
      console.log(error)
    }
  };

  const onClickComment = () => {
    setIsShowComment(!isShowComment);
  };

  const onChangeComment = (e) => {
    setComment(e.target.value);
  };

  const onUpdateComment = (id, newComment) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === id) return newComment;
        return comment;
      })
    );
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const onCreateNeWComment = async () => {
    if (comment === "") {
      messageApi.error("Bình luận không được để trống");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("content", comment);
    formData.append("postId", post.id);
    formData.append("image", selectedImage);

    console.log("FormData values:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    CommentAPI.CreateComment(formData)
      .then((response) => {
        console.log({
          ...response.data.data,
          account: response.data.data.user,
          hasLikedComment: false,
        });
        console.log(comments);
        setComments([
          ...comments,
          {
            ...response.data.data,
            account: response.data.data.user,
            hasLikedComment: false,
          },
        ]);
        setPost({
          ...post,
          commentNum: post.commentNum + 1,
        });
        setComment("");
        setSelectedImage(null);
      })
      .catch((error) => {
        console.error("Error creating comment:", error);
        messageApi.error("Có lỗi xảy ra khi gửi bình luận.");
      });
  };

  const items = [
    {
      label: (
        <div className="d-flex align-items-center">
          <PushpinFilled />{" "}
          <p style={{ margin: 0, padding: 0, marginLeft: "10px" }}>
            Ghim bài viết
          </p>
        </div>
      ),
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: (
        <div className="d-flex align-items-center">
          <EditFilled />{" "}
          <p
            style={{ margin: 0, padding: 0, marginLeft: "10px" }}
            onClick={handleNavigateEdit}
          >
            Chỉnh sửa bài viết
          </p>
        </div>
      ),
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: (
        <div className="d-flex align-items-center">
          <DeleteFilled />
          <p style={{ margin: 0, padding: 0, marginLeft: "10px" }}>
            Chuyển vào thùng rác
          </p>
        </div>
      ),
      key: "3",
    },
  ];

  return (
    <div className="individual-small-post-container">
      {contextHolder}
      <div className="individual-small-post-user-info-container">
        <div className="d-flex">
          <img
            className="individual-small-post-avatar"
            alt="user avatar"
            src={post.postUser?.avatar ? post.postUser.avatar : "#"}
          />
          <div className="individual-small-post-info-container">
            <div className="d-flex align-items-center">
              <p class="individual-small-post-username">
                {post.postUser?.displayName
                  ? post.postUser.displayName
                  : "Empty User"}
              </p>
              <p class="individual-small-post-status">
                <FaCircle />
              </p>
            </div>
            <p className="individual-small-post-createdAt">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <div>
          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
            className="individual-small-post-dropdown"
          >
            <BiDotsHorizontal onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </div>
      </div>
      <div className="individual-small-post-content-container">
        <p class="individual-small-post-content">{post.content}</p>
        {post.image && (
          <Image
            className="individual-small-post-image"
            alt="post pic"
            src={post.image}
          />
        )}
        <div className="individual-small-post-like-comment-container">
          <p>{post.likeNum}</p>
          <Button
            icon={
              !isLike ? (
                <HeartOutlined style={{ fontSize: "25px" }} />
              ) : (
                <HeartFilled style={{ fontSize: "25px" }} />
              )
            }
            onClick={onLike}
            className="individual-small-post-button"
            style={{ color: "#EB3223" }}
          />
          <p>{post.commentNum}</p>
          <Button
            icon={<FaRegCommentDots />}
            onClick={onClickComment}
            className="individual-small-post-button"
          />
        </div>
        {isShowComment && (
          <div className="individual-small-post-comment-container">
            <img
              alt="user avatar"
              src={user.avatar}
              className="individual-small-post-avatar"
            />
            <div className="w-100">
              <div className="individual-small-post-input-container">
                <TextArea
                  placeholder={`Bình luận với vai trò ${user.displayName}`}
                  className="individual-small-post-input"
                  autoSize
                  value={comment}
                  onChange={(value) => onChangeComment(value)}
                />
                <div className="individual-small-post-button-container">
                  <Button
                    icon={<FaRegImage />}
                    className="individual-small-post-button"
                    onClick={() =>
                      document.getElementById("comment-image-input").click()
                    }
                  />
                  <input
                    type="file"
                    id="comment-image-input"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e)}
                  />
                  <Button
                    icon={<ImGrin />}
                    className="individual-small-post-button"
                  />
                  <Button
                    icon={<BsCursorFill />}
                    className="individual-small-post-button"
                    onClick={onCreateNeWComment}
                  />
                </div>
              </div>
              {selectedImage && (
                <div className="individual-small-post-image-comment-container">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="individual-small-post-image-comment"
                  />
                  <Button
                    onClick={() => setSelectedImage(null)}
                    icon={<CloseOutlined />}
                    className="individual-small-post-image-comment-button"
                  ></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isShowComment && (
        <div className="individual-small-post-comment-wrapper">
          {comments &&
            comments.length > 0 &&
            comments.map((comment) => (
              <SmallComment
                comment={comment}
                user={user}
                onUpdateComment={onUpdateComment}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default SmallPost;

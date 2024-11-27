import React, { useState } from "react";
import "./index.scss";
import { Button, Dropdown, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CloseOutlined,
  DeleteFilled,
  EditFilled,
  HeartFilled,
  HeartOutlined,
  PushpinFilled,
  PushpinOutlined,
} from "@ant-design/icons";
import { FaCircle, FaRegCommentDots } from "react-icons/fa";
import TextArea from "antd/es/input/TextArea";
import { ImGrin } from "react-icons/im";
import { BsCursorFill } from "react-icons/bs";
import SmallComment from "../SmallComment";
import LikeAPI from "../../../../../../src/api/likeAPI";
import { BiDotsHorizontal } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegImage } from "react-icons/fa";
import CommentAPI from "../../../../../../src/api/commentAPI";
import { useAuth } from "../../../../../../src/context/authContext";
import SavePostAPI from "../../../../../api/savePostAPI";

const checkLike = (likes, userId) => {
  return likes.includes(userId);
};

const checkSave = (save, userId) => {
  return save.includes(userId);
};

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
  const { user: userProfile } = useAuth();
  const { user, onUpdatePost } = props;

  const [post, setPost] = useState(props.post);

  const [messageApi, contextHolder] = message.useMessage();
  const [isLike, setIsLike] = useState(checkLike(post.likes, user.userId));
  const [selectedImage, setSelectedImage] = useState(null);
  const [comment, setComment] = useState("");
  const [isShowComment, setIsShowComment] = useState(false);

  const [comments, setComments] = useState(post.comments);

  // console.log(post);

  const [isPin, setIsPin] = useState(checkSave(post.savePeoples, user.userId));
  const handleNavigateEdit = () => {
    navigate("/editpost", { state: { post, user } }); // Đường dẫn đến trang bạn muốn chuyển hướng
  };
  const onLike = () => {
    try {
      LikeAPI.LikePost(user.userId, post.id);
      setPost({
        ...post,
        likeNum: isLike ? post.likeNum - 1 : post.likeNum + 1,
      });

      setIsLike(!isLike);
    } catch (error) {
      console.log(error);
    }
  };
  const onClickComment = () => {
    setIsShowComment(!isShowComment);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const onChangeComment = (e) => {
    setComment(e.target.value);
  };
  const handleSavePost = async () => {
    console.log("đây là api luu bai viet");

    try {
      const response = await SavePostAPI.SavePost(user.userId, post.id);
      if (response.data.isSuccess) {
        console.log("Bài viết đã được lưu thành công!"); // Hiển thị thông báo thành công
      } else {
        console.log("Không thể lưu bài viết."); // Thông báo nếu không thành công
      }
    } catch (error) {
      console.error("Error saving post:", error);
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

  const onPin = () => {
    setIsPin(!isPin);
  };

  const navigate = useNavigate();

  const items = [
    {
      label: (
        <div className="d-flex align-items-center">
          <PushpinFilled />
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
          <EditFilled />
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
    <div className="group-small-post-container">
      <div className="group-small-post-user-info-container">
        <div className="d-flex">
          <img
            className="group-small-post-avatar"
            alt="user avatar"
            src={post.postUser?.avatar ? post.postUser.avatar : "#"}
          />
          <div className="group-small-post-info-container">
            <div className="d-flex align-items-center">
              <p class="group-small-post-username">
                {post.postUser?.displayName
                  ? post.postUser.displayName
                  : "Empty User"}
              </p>
              <p class="group-small-post-status">
                <FaCircle />
              </p>
            </div>
            <p className="group-small-post-createdAt">
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
            className="group-small-post-dropdown"
          >
            <BiDotsHorizontal onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </div>
      </div>
      <div className="group-small-post-content-container">
        <p class="group-small-post-content">{post.content}</p>
        {post.image && (
          <img
            className="group-small-post-image"
            alt="post pic"
            src={post.image}
          />
        )}
        <div className="group-small-post-like-comment-container">
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
            className="group-small-post-button"
            style={{ color: "#EB3223" }}
          />
          <p>{post.commentNum}</p>
          <Button
            icon={<FaRegCommentDots />}
            onClick={onClickComment}
            className="group-small-post-button"
          />
          {post.postUser.id !== userProfile.userId && (
            <Button
              icon={
                isPin ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    fill="#ebc351"
                    width="22px"
                    height="22px"
                  >
                    <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="22px"
                    height="22px"
                  >
                    <path d="M0 48C0 21.5 21.5 0 48 0l0 48 0 393.4 130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4 336 48 48 48 48 0 336 0c26.5 0 48 21.5 48 48l0 440c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488L0 48z" />
                  </svg>
                )
              }
              className="group-small-post-button"
              onClick={() => {
                handleSavePost(); // Gọi hàm handleSavePost
                onPin(); // Gọi hàm onPin
              }}
              s
            />
          )}
        </div>
        {isShowComment && (
          <div className="group-small-post-comment-container">
            <img
              alt="user avatar"
              src={userProfile?.avatar ? userProfile.avatar : "#"}
              className="group-small-post-comment-avatar"
            />
            <div className="group-small-post-input-container">
              <div className="group-small-post-comment-input">
                <TextArea
                  placeholder={`Bình luận với vai trò ${user.displayName}`}
                  className="group-small-post-input"
                  autoSize
                  value={comment}
                  onChange={(value) => onChangeComment(value)}
                />
                <div className="group-small-post-button-container">
                  <Button
                    icon={<FaRegImage />}
                    className="group-small-post-button"
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
                    className="group-small-post-button"
                  />

                  <Button
                    icon={<BsCursorFill />}
                    onClick={onCreateNeWComment}
                    className="group-small-post-button"
                  />
                </div>
              </div>
              {selectedImage && (
                <div className="group-small-post-image-comment-container">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="group-small-post-image-comment"
                  />
                  <Button
                    onClick={() => setSelectedImage(null)}
                    icon={<CloseOutlined />}
                    className="group-small-post-image-comment-button"
                  ></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isShowComment && (
        <div className="group-small-post-comment-wrapper">
          {comments &&
            comments.length > 0 &&
            comments.map((comment) => (
              <SmallComment comment={comment} user={user} />
            ))}
        </div>
      )}
    </div>
  );
}

export default SmallPost;

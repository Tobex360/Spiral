import React, { useState, useRef } from 'react';
import { Modal, Input, Button, message, Spin, Select, Avatar } from 'antd';
import { PlusOutlined, CloseOutlined, PictureOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../config/api';

const { TextArea } = Input;

function CreatePostModal({ isOpen, onClose, onPostCreated, initialGameId, initialGameName }) {
  const [description, setDescription] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameOptions, setGameOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-fill game when initialGameId is provided
  React.useEffect(() => {
    if (initialGameId && isOpen) {
      setSelectedGame(initialGameId);
      if (initialGameName) {
        setGameOptions([{
          label: initialGameName,
          value: initialGameId,
          image: null
        }]);
      }
    }
  }, [initialGameId, initialGameName, isOpen]);

  const handleGameSearch = async (value) => {
    if (!value || value.length < 2) {
      setGameOptions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`/api/games?search=${value}&page_size=10`);
      const options = res.data.results.map((game) => ({
        label: game.name,
        value: game.id,
        image: game.background_image,
      }));
      setGameOptions(options);
    } catch (err) {
      message.error('Failed to search games');
    } finally {
      setSearching(false);
    }
  };

  const handleImageChange = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('Image size must be less than 5MB');
      return false;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    return false;
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      message.warning('Please fill in all required fields');
      return;
    }
    const userStored = localStorage.getItem('user');
    if (!userStored) return message.error('Please log in');

    setLoading(true);
    try {
      const formData = new FormData();
      // formData.append('gameId', selectedGame);
      if (selectedGame) {
        formData.append("gameId", selectedGame);
      }
      formData.append('description', description);
      if (imageFile) formData.append('file', imageFile);

      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(userStored).token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = await axios.post(`${API_URL}/posts`, formData, config);
      message.success('New Post Created');
      handleCancel();
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Uplink failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    setSelectedGame(null);
    setGameOptions([]);
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 py-2">
          <PlusOutlined className="text-red-500" />
          <span className="font-audiowide text-xl text-black uppercase tracking-wider">New Post</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button 
          key="cancel" 
          onClick={handleCancel} 
          className="border-white/10 text-gray-400 hover:text-white bg-transparent font-tomorrow uppercase tracking-widest text-xs"
        >
          Leave
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-500 border-0 font-audiowide uppercase tracking-widest px-8"
        >
          Post
        </Button>,
      ]}
      width={600}
      centered
      className="cyberpunk-modal"
      styles={{
        content: {
          backgroundColor: '#0d0d0d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '15px'
        },
        body: {
          padding: '24px'
        },
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0,0,0,0.8)'
        }
      }}
    >
      <div className="space-y-6 font-tomorrow">
        {/* Game Selection */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 mb-2 tracking-[0.2em]">
            🎮 Game
          </label>
          <Select
            showSearch
            placeholder="Search game title (Optional)..."
            value={selectedGame}
            onChange={setSelectedGame}
            onSearch={handleGameSearch}
            loading={searching}
            filterOption={false}
            className="w-full cyberpunk-select"
            popupClassName="cyberpunk-dropdown"
            suffixIcon={<PlusOutlined className="text-gray-600" />}
            optionRender={(option) => (
              <div className="flex items-center gap-3 py-1">
                <Avatar src={option.data.image} shape="square" size="small" className="border border-white/10" />
                <span className="text-gray-300 font-tomorrow">{option.data.label}</span>
              </div>
            )}
            options={gameOptions}
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 mb-2 tracking-[0.2em]">
            <MessageOutlined className="text-red-500" />Thoughts
          </label>
          <TextArea
            rows={5}
            placeholder="Share your experience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            className="bg-white/5 border-white/10 text-black placeholder-gray-600 rounded-xl hover:border-red-500/50 focus:border-red-500 transition-all p-4"
            style={{ resize: 'none' }}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 mb-2 tracking-[0.2em]">
            <PictureOutlined className="text-red-500" /> Image
          </label>
          {imagePreview ? (
            <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="bg-red-600 text-white rounded-full p-3 hover:scale-110 transition-transform"
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="group border-2 border-dashed border-white/5 rounded-2xl p-10 text-center cursor-pointer hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <PlusOutlined className="text-xl text-gray-400 group-hover:text-red-500" />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Upload Image</p>
              <p className="text-gray-600 text-[10px] mt-1">PNG, JPG, WEBP (Max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageChange(file);
                }}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CreatePostModal;
// // AudioMessageForm.jsx (Updated)
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { uploadAudioToSanity } from '@/lib/sanity';

// const AudioMessageForm = ({ onSubmit, onClose }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     audioFile: null,
//     caption: '',
//     description: '',
//     mood: '',
//     duration: 0,
//     isPrivate: false,
//     backgroundMusic: null,
//     visualizer: 'wave',
//     scheduledFor: '',
//     transcript: '',
//     reactions: [],
//     background: { color: '#ffffff', imageUrl: '', style: '' }
//   });

//   const [isUploading, setIsUploading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [newReaction, setNewReaction] = useState({ emoji: '', count: 1 });

//   const handleFileChange = async (e, field) => {
//     const file = e.target.files[0];
//     if (file) {
//       setIsUploading(true);
//       try {
//         const uploadedAsset = await uploadAudioToSanity(file);
//         setFormData(prev => ({ ...prev, [field]: uploadedAsset }));
//         if (field === 'audioFile') {
//           setPreviewUrl(URL.createObjectURL(file));
//         }
//       } catch (error) {
//         console.error('Upload failed:', error);
//       }
//       setIsUploading(false);
//     }
//   };

//   const addReaction = () => {
//     if (newReaction.emoji) {
//       setFormData(prev => ({
//         ...prev,
//         reactions: [...prev.reactions, { ...newReaction }]
//       }));
//       setNewReaction({ emoji: '', count: 1 });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await onSubmit(formData);
//       onClose();
//     } catch (error) {
//       console.error('Submission failed:', error);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
//     >
//       <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-gray-800">Create Audio Message</h2>
//             <button
//               type="button"
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Title */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Title *</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </motion.div>

//           {/* Audio File Upload */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Audio File *</label>
//             <input
//               type="file"
//               accept="audio/*"
//               onChange={(e) => handleFileChange(e, 'audioFile')}
//               className="w-full p-3 border rounded-lg"
//               required
//             />
//             {previewUrl && (
//               <audio controls src={previewUrl} className="w-full mt-2" />
//             )}
//           </motion.div>

//           {/* Caption & Description */}
//           <div className="grid grid-cols-2 gap-4">
//             <motion.div whileHover={{ scale: 1.02 }}>
//               <label className="block text-sm font-medium text-gray-700">Caption</label>
//               <input
//                 type="text"
//                 value={formData.caption}
//                 onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
//                 className="w-full p-3 border rounded-lg"
//               />
//             </motion.div>
//             <motion.div whileHover={{ scale: 1.02 }}>
//               <label className="block text-sm font-medium text-gray-700">Description</label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="w-full p-3 border rounded-lg h-24"
//               />
//             </motion.div>
//           </div>

//           {/* Mood & Visualizer */}
//           <div className="grid grid-cols-2 gap-4">
//             <motion.div whileHover={{ scale: 1.02 }}>
//               <label className="block text-sm font-medium text-gray-700">Mood</label>
//               <select
//                 value={formData.mood}
//                 onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
//                 className="w-full p-3 border rounded-lg"
//               >
//                 <option value="">Select Mood</option>
//                 {['romantic', 'happy', 'reflective', 'playful', 'missingYou'].map(mood => (
//                   <option key={mood} value={mood}>
//                     {mood.charAt(0).toUpperCase() + mood.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </motion.div>
//             <motion.div whileHover={{ scale: 1.02 }}>
//               <label className="block text-sm font-medium text-gray-700">Visualizer</label>
//               <select
//                 value={formData.visualizer}
//                 onChange={(e) => setFormData({ ...formData, visualizer: e.target.value })}
//                 className="w-full p-3 border rounded-lg"
//               >
//                 {['wave', 'bars', 'circle', 'heart', 'none'].map(style => (
//                   <option key={style} value={style}>
//                     {style.charAt(0).toUpperCase() + style.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </motion.div>
//           </div>

//           {/* Duration & Privacy */}
//           <div className="grid grid-cols-2 gap-4">
//             <motion.div whileHover={{ scale: 1.02 }}>
//               <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
//               <input
//                 type="number"
//                 value={formData.duration}
//                 onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
//                 className="w-full p-3 border rounded-lg"
//               />
//             </motion.div>
//             <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={formData.isPrivate}
//                 onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
//                 className="w-5 h-5"
//               />
//               <label className="text-sm font-medium text-gray-700">Private Message</label>
//             </motion.div>
//           </div>

//           {/* Background Music */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Background Music</label>
//             <input
//               type="file"
//               accept="audio/*"
//               onChange={(e) => handleFileChange(e, 'backgroundMusic')}
//               className="w-full p-3 border rounded-lg"
//             />
//           </motion.div>

//           {/* Scheduled Delivery */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Scheduled Delivery</label>
//             <input
//               type="datetime-local"
//               value={formData.scheduledFor}
//               onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
//               className="w-full p-3 border rounded-lg"
//             />
//           </motion.div>

//           {/* Transcript */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Transcript</label>
//             <textarea
//               value={formData.transcript}
//               onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
//               className="w-full p-3 border rounded-lg h-32"
//             />
//           </motion.div>

//           {/* Reactions */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Reactions</label>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 placeholder="Emoji (e.g., ❤️)"
//                 value={newReaction.emoji}
//                 onChange={(e) => setNewReaction({ ...newReaction, emoji: e.target.value })}
//                 className="flex-1 p-3 border rounded-lg"
//               />
//               <input
//                 type="number"
//                 min="1"
//                 value={newReaction.count}
//                 onChange={(e) => setNewReaction({ ...newReaction, count: parseInt(e.target.value) })}
//                 className="w-20 p-3 border rounded-lg"
//               />
//               <button
//                 type="button"
//                 onClick={addReaction}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//               >
//                 Add
//               </button>
//             </div>
//             <div className="mt-2 flex flex-wrap gap-2">
//               {formData.reactions.map((reaction, index) => (
//                 <span
//                   key={index}
//                   className="px-2 py-1 bg-gray-100 rounded-full text-sm"
//                 >
//                   {reaction.emoji} × {reaction.count}
//                 </span>
//               ))}
//             </div>
//           </motion.div>

//           {/* Background Settings */}
//           <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Background</label>
//             <div className="space-y-2">
//               <div className="flex space-x-2">
//                 <input
//                   type="color"
//                   value={formData.background.color}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     background: { ...formData.background, color: e.target.value }
//                   })}
//                   className="w-20 h-10"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Style (e.g., gradient, pattern)"
//                   value={formData.background.style}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     background: { ...formData.background, style: e.target.value }
//                   })}
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//               </div>
//               <input
//                 type="url"
//                 placeholder="Image URL"
//                 value={formData.background.imageUrl}
//                 onChange={(e) => setFormData({
//                   ...formData,
//                   background: { ...formData.background, imageUrl: e.target.value }
//                 })}
//                 className="w-full p-3 border rounded-lg"
//               />
//             </div>
//           </motion.div>

//           {/* Submit Button */}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             disabled={isUploading}
//             className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
//           >
//             {isUploading ? 'Uploading...' : 'Create Message'}
//           </motion.button>
//         </form>
//       </div>
//     </motion.div>
//   );
// };

// export default AudioMessageForm;
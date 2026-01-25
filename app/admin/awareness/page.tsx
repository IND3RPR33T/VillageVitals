'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './awareness.module.css';

interface AwarenessContent {
    id: string;
    title: string;
    description: string;
    category: 'health_tips' | 'disease_prevention' | 'water_safety' | 'news' | 'emergency';
    imageUrl?: string;
    link?: string;
    priority: 'low' | 'medium' | 'high';
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string;
}

export default function AwarenessAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [contents, setContents] = useState<AwarenessContent[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'health_tips' as const,
        imageUrl: '',
        link: '',
        priority: 'medium' as const,
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                router.push('/auth/login');
            } else {
                loadContents();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const loadContents = async () => {
        try {
            const q = query(collection(db, 'awarenessContent'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const contentList: AwarenessContent[] = [];
            snapshot.forEach((doc) => {
                contentList.push({ id: doc.id, ...doc.data() } as AwarenessContent);
            });
            setContents(contentList);
        } catch (error) {
            console.error('Error loading awareness content:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (editingId) {
                // Update existing
                await updateDoc(doc(db, 'awarenessContent', editingId), {
                    ...formData,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Add new
                await addDoc(collection(db, 'awarenessContent'), {
                    ...formData,
                    isActive: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdBy: user.uid,
                });
            }

            resetForm();
            loadContents();
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save content. Please try again.');
        }
    };

    const handleEdit = (content: AwarenessContent) => {
        setFormData({
            title: content.title,
            description: content.description,
            category: content.category,
            imageUrl: content.imageUrl || '',
            link: content.link || '',
            priority: content.priority,
        });
        setEditingId(content.id);
        setIsAddingNew(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            await deleteDoc(doc(db, 'awarenessContent', id));
            loadContents();
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content. Please try again.');
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, 'awarenessContent', id), {
                isActive: !currentStatus,
                updatedAt: serverTimestamp(),
            });
            loadContents();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'health_tips',
            imageUrl: '',
            link: '',
            priority: 'medium',
        });
        setIsAddingNew(false);
        setEditingId(null);
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            health_tips: '💡 Health Tips',
            disease_prevention: '🛡️ Disease Prevention',
            water_safety: '💧 Water Safety',
            news: '📰 News',
            emergency: '🚨 Emergency',
        };
        return labels[category] || category;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>📢 Awareness Content Manager</h1>
                    <p className={styles.subtitle}>Create and manage health awareness content for the mobile app</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => setIsAddingNew(true)}
                >
                    + Add New Content
                </button>
            </div>

            {/* Add/Edit Form Modal */}
            {isAddingNew && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter content title"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter detailed description..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <option value="health_tips">Health Tips</option>
                                        <option value="disease_prevention">Disease Prevention</option>
                                        <option value="water_safety">Water Safety</option>
                                        <option value="news">News</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Priority *</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Image URL (optional)</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>External Link (optional)</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://example.com/article"
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    {editingId ? 'Update' : 'Create'} Content
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content List */}
            <div className={styles.contentGrid}>
                {contents.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>📭 No awareness content yet</p>
                        <p>Click "Add New Content" to create your first awareness post</p>
                    </div>
                ) : (
                    contents.map((content) => (
                        <div key={content.id} className={`${styles.contentCard} ${!content.isActive ? styles.inactive : ''}`}>
                            <div className={styles.cardHeader}>
                                <span className={styles.category}>{getCategoryLabel(content.category)}</span>
                                <span
                                    className={styles.priority}
                                    style={{ backgroundColor: getPriorityColor(content.priority) }}
                                >
                                    {content.priority}
                                </span>
                            </div>

                            {content.imageUrl && (
                                <img src={content.imageUrl} alt={content.title} className={styles.cardImage} />
                            )}

                            <h3 className={styles.cardTitle}>{content.title}</h3>
                            <p className={styles.cardDescription}>{content.description}</p>

                            {content.link && (
                                <a href={content.link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                                    🔗 Learn more
                                </a>
                            )}

                            <div className={styles.cardActions}>
                                <button
                                    className={`${styles.statusToggle} ${content.isActive ? styles.active : ''}`}
                                    onClick={() => toggleActive(content.id, content.isActive)}
                                >
                                    {content.isActive ? '✅ Active' : '⏸️ Inactive'}
                                </button>
                                <button className={styles.editButton} onClick={() => handleEdit(content)}>
                                    ✏️ Edit
                                </button>
                                <button className={styles.deleteButton} onClick={() => handleDelete(content.id)}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

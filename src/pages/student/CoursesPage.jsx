// src/pages/student/CoursesPage.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { studentApi } from '@/services/api';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import toast from 'react-hot-toast';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CourseCard = ({ course, index, onPurchase, isAuthenticated, isProcessing }) => {
  const finalPrice = course.finalPrice || course.price || 0;
  const currency = course.currency || 'INR';
  const isFree = course.isFree || !course.isPaid || finalPrice === 0;

console.log("PUBLIC COURSES =", publicCourses);
console.log("ENROLLED COURSES =", enrolledCourses);
console.log("DISPLAY COURSES =", displayCourses);
console.log("AUTH =", isAuthenticated);
console.log("USER =", user);

  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
      className="card hover:shadow-md transition-all duration-200 group"
    >
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.name}
          className="w-full h-40 object-cover rounded-xl mb-4" />
      ) : (
        <div className="w-full h-40 rounded-xl mb-4 flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.15))' }}>
          📚
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold group-hover:text-primary-600 transition-colors leading-tight"
          style={{ color: 'var(--color-text-primary)' }}>
          {course.name}
        </h3>
        <span className="badge badge-primary text-xs ml-2 flex-shrink-0 capitalize">
          {course.level || 'beginner'}
        </span>
      </div>
      
      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
        {course.description}
      </p>
      
      <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        <span>👨‍🏫 {course.instructor}</span>
        <span>📝 {course.quizzes?.length || 0} quizzes</span>
        {course.category && <span>🏷 {course.category}</span>}
      </div>
      
      {/* Button Logic */}
      {course.isEnrolled ? (
        <Link to={`/student/quizzes?course=${course._id}`} className="btn-primary w-full justify-center text-sm">
          Continue Learning →
        </Link>
      ) : !isFree ? (
        isAuthenticated ? (
          <button 
            onClick={() => onPurchase(course)}
            disabled={isProcessing === course._id}
            className="btn-primary w-full justify-center text-sm bg-gradient-to-r from-primary-600 to-primary-500 disabled:opacity-50"
          >
            {isProcessing === course._id ? 'Processing...' : `Buy Now - ${currency} ${finalPrice}`}
          </button>
        ) : (
          <Link to="/login" className="btn-primary w-full justify-center text-sm">
            Login to Buy - {currency} {finalPrice}
          </Link>
        )
      ) : (
        isAuthenticated ? (
          <button 
            onClick={() => onPurchase(course)}
            disabled={isProcessing === course._id}
            className="btn-primary w-full justify-center text-sm disabled:opacity-50"
          >
            {isProcessing === course._id ? 'Enrolling...' : 'Enroll for Free'}
          </button>
        ) : (
          <Link to="/login" className="btn-primary w-full justify-center text-sm">
            Login to Enroll Free
          </Link>
        )
      )}
    </motion.div>
  );
};

export default function CoursesPage() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [processingCourse, setProcessingCourse] = useState(null);
  
  // Fetch public courses (no auth needed)
  const {
    data: publicCourses,
    isLoading: loadingPublic,
    refetch: refetchPublic
  } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses/public');
      const data = await response.json();
      return data.data;
    },
    enabled: true
  });
  
  // Fetch enrolled courses (only if logged in)
  const { 
    data: enrolledCourses, 
    isLoading: loadingEnrolled,
    refetch: refetchEnrolled
  } = useQuery({
    queryKey: ['student-courses', user?._id],
   queryFn: async () => {
  const response = await fetch('/api/courses/public');

  console.log('Response Status:', response.status);

  const data = await response.json();

  alert(JSON.stringify(data));

  return data.data;
},
    enabled: isAuthenticated && user?.role === 'student'
  });
  
  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (course) => {
      const response = await studentApi.post('/payments/create-order', {
        courseId: course._id
      });
      return response.data;
    },
    onSuccess: async (data, variables) => {
      const course = variables;
      
      if (data.isFree) {
        // Free course - directly enrolled
        toast.success('Successfully enrolled!');
        await refetchEnrolled();
        await refetchPublic();
        setProcessingCourse(null);
      } else if (data.orderId) {
        // Paid course - open Razorpay
        await openRazorpayCheckout(data, course);
      }
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Purchase failed');
      setProcessingCourse(null);
    }
  });
  
  const openRazorpayCheckout = async (paymentData, course) => {
    try {
      // Load Razorpay script if not loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway. Please refresh and try again.');
        setProcessingCourse(null);
        return;
      }
      
      // Store payment ID for verification
      localStorage.setItem('lastPaymentId', paymentData.paymentId);
      
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: course.name,
        description: `Enroll in ${course.name}`,
        order_id: paymentData.orderId,
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#6366F1'
        },
        modal: {
          ondismiss: function() {
            // User closed the modal
            toast.error('Payment cancelled');
            setProcessingCourse(null);
            localStorage.removeItem('lastPaymentId');
          }
        },
        handler: async function(response) {
          // Payment successful - verify on backend
          try {
            const verifyResponse = await studentApi.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentData.paymentId
            });
            
            if (verifyResponse.data.success) {
              toast.success('Payment successful! You are now enrolled.');
              // Refresh the courses lists
              await refetchEnrolled();
              await refetchPublic();
              // Switch to "My Courses" tab
              setActiveTab('my');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setProcessingCourse(null);
            localStorage.removeItem('lastPaymentId');
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Razorpay checkout error:', error);
      toast.error('Failed to open payment gateway');
      setProcessingCourse(null);
    }
  };
  
  const handlePurchase = async (course) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    setProcessingCourse(course._id);
    await purchaseMutation.mutateAsync(course);
  };
  
  // Get courses with enrollment status
  const getCoursesWithEnrollmentStatus = () => {
    if (!publicCourses) return [];
    
    if (!isAuthenticated || !enrolledCourses) {
      return publicCourses.map(c => ({ ...c, isEnrolled: false }));
    }
    
    const enrolledIds = new Set(enrolledCourses.map(c => c._id));
    return publicCourses.map(c => ({ 
      ...c, 
      isEnrolled: enrolledIds.has(c._id) 
    }));
  };
  
  const displayCourses = getCoursesWithEnrollmentStatus();
  
  return (
    <div className="space-y-6">
      {/* Tabs - Only show if logged in */}
      {isAuthenticated && (
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Courses ({enrolledCourses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'marketplace' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Courses
          </button>
        </div>
      )}
      
      {/* All Courses View */}
      {(!isAuthenticated || activeTab === 'marketplace') && (
        <>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {isAuthenticated ? 'All Courses' : 'Welcome to QuizMaster'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {isAuthenticated 
                ? 'Browse and enroll in courses' 
                : 'Login to enroll in courses'}
            </p>
          </div>
          
          {loadingPublic ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-sm">Check back later for new courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCourses.map((course, i) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  index={i} 
                  onPurchase={handlePurchase}
                  isAuthenticated={isAuthenticated}
                  isProcessing={processingCourse}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* My Courses View - Only for logged in users */}
      {isAuthenticated && activeTab === 'my' && (
        <>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Courses</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {enrolledCourses?.length || 0} course{enrolledCourses?.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          
          {loadingEnrolled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : enrolledCourses?.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-sm mb-4">You haven't enrolled in any courses yet.</p>
              <button onClick={() => setActiveTab('marketplace')} className="btn-primary">
                Browse Courses →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course, i) => (
                <CourseCard 
                  key={course._id} 
                  course={{ ...course, isEnrolled: true }} 
                  index={i} 
                  onPurchase={handlePurchase}
                  isAuthenticated={isAuthenticated}
                  isProcessing={processingCourse}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
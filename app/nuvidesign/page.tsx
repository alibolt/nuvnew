'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '@/app/styles/admin-theme.css';
import { 
  ArrowLeft, Package, Plus, Download, Edit, Trash2, X, Upload, AlertCircle, 
  Image, ChevronDown, Copy, ChevronRight, ChevronUp, Calendar, Clock, 
  Check, CreditCard, File, FileText, Home, Info, Loader2, Mail, 
  Menu, Moon, MoreHorizontal, Phone, Search, Settings, Star, 
  Sun, User, Users, Zap, Bell, MessageSquare, Shield, Eye, EyeOff, Megaphone,
  HelpCircle, ExternalLink, Link2, Hash, Type, Bold, Italic, List,
  CheckCircle, XCircle, AlertTriangle, Paperclip, Send, Heart,
  Share2, Bookmark, Flag, Tag, Filter, SortAsc, MoreVertical,
  Terminal, Wifi, WifiOff, Activity, Airplay, AlertOctagon,
  Archive, BarChart, Battery, Bluetooth, Camera, Cast, Clipboard,
  Cloud, Code, Command, Compass, Cpu, Database, DollarSign,
  Feather, Film, Folder, Gift, GitBranch, Globe, Grid,
  Headphones, Inbox, Layers, Layout, LifeBuoy, Loader,
  Lock, LogIn, LogOut, Map, Maximize, Mic, Minimize,
  Monitor, Move, Music, Navigation, Package2, Pause, Play,
  Pocket, Power, Printer, Radio, RefreshCw, Repeat, RotateCcw,
  Save, Scissors, Server, Share, ShoppingBag, ShoppingCart,
  Shuffle, Sidebar, SkipBack, SkipForward, Slack, Slash,
  Sliders, Smartphone, Speaker, Square, Sunrise, Sunset,
  Tablet, Target, Thermometer, ToggleLeft, ToggleRight, Tool,
  TrendingDown, TrendingUp, Tv, Twitter, Umbrella, Underline,
  Unlock, UserCheck, UserMinus, UserPlus, UserX, Video,
  VideoOff, Volume, Volume1, Volume2, VolumeX, Watch, Wind,
  Youtube, ZapOff, ZoomIn, ZoomOut, ChevronLeft
} from 'lucide-react';

export default function NuviDesignSystemComplete() {
  const [activeTab, setActiveTab] = useState('accordion');
  const [openAccordion, setOpenAccordion] = useState('item-1');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [tabValue, setTabValue] = useState('account');
  const [alertVisible, setAlertVisible] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [progress, setProgress] = useState(66);
  const [rating, setRating] = useState(3);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [toggleGroupValue, setToggleGroupValue] = useState('bold');
  const [otpValue, setOtpValue] = useState('');
  
  // Vertical Navigation states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products']);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  
  // Table states
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const renderAccordion = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Accordion</h2>
      
      {/* Basic Accordion */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Accordion</h3>
        <div className="nuvi-accordion" style={{ maxWidth: '600px' }}>
          <div className="nuvi-accordion-item">
            <button
              className="nuvi-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === 'item-1' ? '' : 'item-1')}
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
              }}
            >
              Is it accessible?
              <ChevronDown 
                size={16} 
                style={{
                  transform: openAccordion === 'item-1' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {openAccordion === 'item-1' && (
              <div className="nuvi-accordion-content" style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                Yes. It adheres to the WAI-ARIA design pattern.
              </div>
            )}
          </div>
          
          <div className="nuvi-accordion-item">
            <button
              className="nuvi-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === 'item-2' ? '' : 'item-2')}
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
              }}
            >
              Is it styled?
              <ChevronDown 
                size={16} 
                style={{
                  transform: openAccordion === 'item-2' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {openAccordion === 'item-2' && (
              <div className="nuvi-accordion-content" style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                Yes. It comes with default styles that match the Nuvi design system.
              </div>
            )}
          </div>
          
          <div className="nuvi-accordion-item">
            <button
              className="nuvi-accordion-trigger"
              onClick={() => setOpenAccordion(openAccordion === 'item-3' ? '' : 'item-3')}
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
              }}
            >
              Is it animated?
              <ChevronDown 
                size={16} 
                style={{
                  transform: openAccordion === 'item-3' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {openAccordion === 'item-3' && (
              <div className="nuvi-accordion-content" style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                Yes. It's animated by default with smooth transitions.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion with Icons */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Accordion with Icons</h3>
        <div className="nuvi-accordion" style={{ maxWidth: '600px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="nuvi-accordion-item">
            <button
              className="nuvi-accordion-trigger"
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: openAccordion === 'icon-1' ? '#F9FAFB' : 'transparent',
                border: 'none',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
              }}
              onClick={() => setOpenAccordion(openAccordion === 'icon-1' ? '' : 'icon-1')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={20} style={{ color: '#8B9F7E' }} />
                General Settings
              </div>
              <ChevronRight 
                size={16} 
                style={{
                  transform: openAccordion === 'icon-1' ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {openAccordion === 'icon-1' && (
              <div style={{ padding: '16px', fontSize: '14px', color: '#6B7280', backgroundColor: '#F9FAFB' }}>
                Configure general application settings including language, timezone, and display preferences.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlert = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Alert</h2>
      
      {/* Alert Variants */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Alert Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
          {/* Default Alert */}
          <div className="nuvi-alert" style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <Terminal size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Heads up!</h4>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>You can add components to your app using the cli.</p>
            </div>
          </div>

          {/* Destructive Alert */}
          <div className="nuvi-alert nuvi-alert-danger" style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <AlertCircle size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Error</h4>
              <p style={{ fontSize: '14px' }}>Your session has expired. Please log in again.</p>
            </div>
          </div>

          {/* Success Alert */}
          <div className="nuvi-alert nuvi-alert-success" style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <CheckCircle size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Success</h4>
              <p style={{ fontSize: '14px' }}>Your changes have been saved successfully.</p>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="nuvi-alert nuvi-alert-warning" style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <AlertTriangle size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Warning</h4>
              <p style={{ fontSize: '14px' }}>This action cannot be undone.</p>
            </div>
          </div>

          {/* Info Alert */}
          <div className="nuvi-alert nuvi-alert-info" style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Info size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Info</h4>
              <p style={{ fontSize: '14px' }}>New update available. Click here to learn more.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dismissible Alert */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Dismissible Alert</h3>
        {alertVisible && (
          <div className="nuvi-alert" style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', maxWidth: '600px' }}>
            <Bell size={16} style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>New notification</h4>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>You have a new message from the team.</p>
            </div>
            <button
              onClick={() => setAlertVisible(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {!alertVisible && (
          <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm" onClick={() => setAlertVisible(true)}>
            Show Alert Again
          </button>
        )}
      </div>
    </div>
  );

  const renderAvatar = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Avatar</h2>
      
      {/* Avatar Sizes */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Avatar Sizes</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Small */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar nuvi-avatar-sm" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>
              JD
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Small</p>
          </div>

          {/* Medium */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
              JD
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Medium</p>
          </div>

          {/* Large */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar nuvi-avatar-lg" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: '600' }}>
              JD
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Large</p>
          </div>

          {/* Extra Large */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar nuvi-avatar-xl" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '600' }}>
              JD
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Extra Large</p>
          </div>
        </div>
      </div>

      {/* Avatar with Image */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Avatar Variants</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* With Image */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
              <img src="/api/placeholder/40/40" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Image</p>
          </div>

          {/* With Icon */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} style={{ color: '#6B7280' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Icon</p>
          </div>

          {/* With Status */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                JD
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>With Status</p>
          </div>

          {/* Square */}
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
              JD
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Square</p>
          </div>
        </div>
      </div>

      {/* Avatar Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Avatar Group</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B9F7E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', border: '2px solid white', marginRight: '-12px', zIndex: 3 }}>
            JD
          </div>
          <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', border: '2px solid white', marginRight: '-12px', zIndex: 2 }}>
            AB
          </div>
          <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', border: '2px solid white', marginRight: '-12px', zIndex: 1 }}>
            CD
          </div>
          <div className="nuvi-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '14px', fontWeight: '600', border: '2px solid white' }}>
            +3
          </div>
        </div>
      </div>
    </div>
  );

  const renderBadge = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Badge</h2>
      
      {/* Badge Variants */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Badge Variants</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span className="nuvi-badge">Default</span>
          <span className="nuvi-badge nuvi-badge-primary">Primary</span>
          <span className="nuvi-badge nuvi-badge-secondary">Secondary</span>
          <span className="nuvi-badge nuvi-badge-success">Success</span>
          <span className="nuvi-badge nuvi-badge-warning">Warning</span>
          <span className="nuvi-badge nuvi-badge-danger">Danger</span>
          <span className="nuvi-badge nuvi-badge-info">Info</span>
        </div>
      </div>

      {/* Badge Styles */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Badge Styles</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span className="nuvi-badge nuvi-badge-primary">Solid</span>
          <span className="nuvi-badge nuvi-badge-outline-primary" style={{ backgroundColor: 'transparent', border: '1px solid #8B9F7E', color: '#8B9F7E' }}>Outline</span>
          <span className="nuvi-badge nuvi-badge-ghost-primary" style={{ backgroundColor: 'rgba(139, 159, 126, 0.1)', color: '#8B9F7E' }}>Ghost</span>
        </div>
      </div>

      {/* Badge with Icon */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Badge with Icon</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span className="nuvi-badge nuvi-badge-success">
            <CheckCircle size={12} style={{ marginRight: '4px' }} />
            Active
          </span>
          <span className="nuvi-badge nuvi-badge-warning">
            <Clock size={12} style={{ marginRight: '4px' }} />
            Pending
          </span>
          <span className="nuvi-badge nuvi-badge-danger">
            <XCircle size={12} style={{ marginRight: '4px' }} />
            Inactive
          </span>
        </div>
      </div>

      {/* Badge in Context */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Badge in Context</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0 }}>Product Title</h4>
            <span className="nuvi-badge nuvi-badge-success">New</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Notifications</span>
            <span className="nuvi-badge nuvi-badge-danger" style={{ borderRadius: '12px', padding: '2px 8px' }}>23</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderButton = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Button</h2>
      
      {/* Button Variants */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Button Variants</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="nuvi-btn nuvi-btn-primary">Primary</button>
          <button className="nuvi-btn nuvi-btn-secondary">Secondary</button>
          <button className="nuvi-btn nuvi-btn-outline">Outline</button>
          <button className="nuvi-btn nuvi-btn-ghost">Ghost</button>
          <button className="nuvi-btn nuvi-btn-destructive">Destructive</button>
          <button className="nuvi-btn nuvi-btn-danger">Danger</button>
          <button className="nuvi-btn nuvi-btn-link" style={{ textDecoration: 'underline' }}>Link</button>
        </div>
      </div>

      {/* Button Sizes */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Button Sizes</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="nuvi-btn nuvi-btn-primary nuvi-btn-xs" style={{ padding: '4px 8px', fontSize: '12px' }}>Extra Small</button>
          <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">Small</button>
          <button className="nuvi-btn nuvi-btn-primary">Default</button>
          <button className="nuvi-btn nuvi-btn-primary nuvi-btn-lg">Large</button>
        </div>
      </div>

      {/* Button with Icon */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Button with Icon</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="nuvi-btn nuvi-btn-primary">
            <Mail size={16} style={{ marginRight: '8px' }} />
            Login with Email
          </button>
          <button className="nuvi-btn nuvi-btn-secondary">
            <ChevronRight size={16} style={{ marginLeft: '8px' }} />
            Next
          </button>
          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Button States */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Button States</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="nuvi-btn nuvi-btn-primary">Normal</button>
          <button className="nuvi-btn nuvi-btn-primary" style={{ opacity: 0.8 }}>Hover</button>
          <button className="nuvi-btn nuvi-btn-primary" style={{ transform: 'scale(0.98)' }}>Active</button>
          <button className="nuvi-btn nuvi-btn-primary" disabled>Disabled</button>
          <button className="nuvi-btn nuvi-btn-primary nuvi-btn-loading">
            <Loader2 className="h-4 w-4 nuvi-animate-spin" style={{ marginRight: '8px' }} />
            Loading
          </button>
        </div>
      </div>

      {/* Button Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Button Group</h3>
        <div className="nuvi-btn-group" style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden' }}>
          <button className="nuvi-btn nuvi-btn-secondary" style={{ borderRadius: 0, borderRight: '1px solid #E5E7EB' }}>Left</button>
          <button className="nuvi-btn nuvi-btn-secondary" style={{ borderRadius: 0, borderRight: '1px solid #E5E7EB' }}>Center</button>
          <button className="nuvi-btn nuvi-btn-secondary" style={{ borderRadius: 0 }}>Right</button>
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Card</h2>
      
      {/* Basic Card */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Card</h3>
        <div className="nuvi-card" style={{ maxWidth: '400px' }}>
          <div className="nuvi-card-header">
            <h4 className="nuvi-card-title">Card Title</h4>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Card description goes here</p>
          </div>
          <div className="nuvi-card-content">
            <p>This is the card content. You can put any content here including forms, lists, or other components.</p>
          </div>
          <div className="nuvi-card-footer" style={{ borderTop: '1px solid #E5E7EB', padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">Cancel</button>
            <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">Save</button>
          </div>
        </div>
      </div>

      {/* Card with Image */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Card with Image</h3>
        <div className="nuvi-card" style={{ maxWidth: '400px', overflow: 'hidden' }}>
          <div style={{ height: '200px', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={48} style={{ color: '#9CA3AF' }} />
          </div>
          <div className="nuvi-card-content">
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Featured Product</h4>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>This is a description of the featured product with all its amazing features.</p>
            <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm" style={{ marginTop: '16px' }}>View Details</button>
          </div>
        </div>
      </div>

      {/* Interactive Card */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Interactive Card</h3>
        <div className="nuvi-card" style={{ maxWidth: '400px', cursor: 'pointer', transition: 'all 0.2s' }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div className="nuvi-card-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: '600' }}>Click me!</h4>
                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>This card has hover effects</p>
              </div>
              <ChevronRight size={20} style={{ color: '#6B7280' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Stats Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', maxWidth: '800px' }}>
          <div className="nuvi-card">
            <div className="nuvi-card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>Total Revenue</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px' }}>$45,231.89</p>
                  <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>+20.1% from last month</p>
                </div>
                <DollarSign size={32} style={{ color: '#8B9F7E' }} />
              </div>
            </div>
          </div>
          
          <div className="nuvi-card">
            <div className="nuvi-card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>Subscriptions</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px' }}>+2,350</p>
                  <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>+180.1% from last month</p>
                </div>
                <Users size={32} style={{ color: '#60A5FA' }} />
              </div>
            </div>
          </div>
          
          <div className="nuvi-card">
            <div className="nuvi-card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>Sales</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px' }}>+12,234</p>
                  <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>+19% from last month</p>
                </div>
                <CreditCard size={32} style={{ color: '#F87171' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCheckbox = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Checkbox</h2>
      
      {/* Basic Checkbox */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Checkbox</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" className="nuvi-checkbox" />
            <span>Accept terms and conditions</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" className="nuvi-checkbox" defaultChecked />
            <span>Send me promotional emails</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: 0.5 }}>
            <input type="checkbox" className="nuvi-checkbox" disabled />
            <span>Disabled checkbox</span>
          </label>
        </div>
      </div>

      {/* Checkbox with Description */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Checkbox with Description</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" className="nuvi-checkbox" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '500' }}>Comments</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Get notified when someone posts a comment on a posting.</div>
            </div>
          </label>
          
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" className="nuvi-checkbox" style={{ marginTop: '2px' }} defaultChecked />
            <div>
              <div style={{ fontWeight: '500' }}>Candidates</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Get notified when a candidate applies for a job.</div>
            </div>
          </label>
          
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" className="nuvi-checkbox" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '500' }}>Offers</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Get notified when a candidate accepts or rejects an offer.</div>
            </div>
          </label>
        </div>
      </div>

      {/* Checkbox Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Checkbox Group</h3>
        <div className="nuvi-card" style={{ maxWidth: '400px' }}>
          <div className="nuvi-card-header">
            <h4 className="nuvi-card-title">Select your interests</h4>
          </div>
          <div className="nuvi-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" className="nuvi-checkbox" />
                <span>Design</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" className="nuvi-checkbox" />
                <span>Development</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" className="nuvi-checkbox" />
                <span>Marketing</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" className="nuvi-checkbox" />
                <span>Business</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInput = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Input</h2>
      
      {/* Basic Inputs */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Inputs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <div>
            <label className="nuvi-label">Email</label>
            <input type="email" className="nuvi-input" placeholder="Enter your email" />
          </div>
          
          <div>
            <label className="nuvi-label">Password</label>
            <input type="password" className="nuvi-input" placeholder="Enter your password" />
          </div>
          
          <div>
            <label className="nuvi-label">Disabled</label>
            <input type="text" className="nuvi-input" placeholder="Disabled input" disabled />
          </div>
        </div>
      </div>

      {/* Input with Icons */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Input with Icons</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <div>
            <label className="nuvi-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input type="text" className="nuvi-input" style={{ paddingLeft: '40px' }} placeholder="Search..." />
            </div>
          </div>
          
          <div>
            <label className="nuvi-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input type="text" className="nuvi-input" style={{ paddingLeft: '40px' }} placeholder="Enter username" />
            </div>
          </div>
        </div>
      </div>

      {/* Input States */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Input States</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <div>
            <label className="nuvi-label">Default</label>
            <input type="text" className="nuvi-input" placeholder="Default state" />
          </div>
          
          <div>
            <label className="nuvi-label">With Error</label>
            <input type="text" className="nuvi-input nuvi-input-error" placeholder="Error state" />
            <p className="nuvi-text-error" style={{ fontSize: '14px', marginTop: '4px' }}>This field is required</p>
          </div>
          
          <div>
            <label className="nuvi-label">With Success</label>
            <input type="text" className="nuvi-input" style={{ borderColor: '#10B981' }} placeholder="Success state" defaultValue="Valid input" />
            <p style={{ fontSize: '14px', marginTop: '4px', color: '#10B981' }}>Looks good!</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRadio = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Radio Group</h2>
      
      {/* Basic Radio Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Radio Group</h3>
        <div className="nuvi-radio-group">
          <div className="nuvi-radio-item">
            <input type="radio" name="plan" value="free" className="nuvi-radio-custom" id="plan-free" />
            <label htmlFor="plan-free">Free Plan</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="plan" value="pro" className="nuvi-radio-custom" id="plan-pro" defaultChecked />
            <label htmlFor="plan-pro">Pro Plan</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="plan" value="enterprise" className="nuvi-radio-custom" id="plan-enterprise" />
            <label htmlFor="plan-enterprise">Enterprise Plan</label>
          </div>
        </div>
      </div>

      {/* Horizontal Radio Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Horizontal Radio Group</h3>
        <div className="nuvi-radio-group-horizontal">
          <div className="nuvi-radio-item">
            <input type="radio" name="size" value="small" className="nuvi-radio-custom" id="size-small" />
            <label htmlFor="size-small">Small</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="size" value="medium" className="nuvi-radio-custom" id="size-medium" defaultChecked />
            <label htmlFor="size-medium">Medium</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="size" value="large" className="nuvi-radio-custom" id="size-large" />
            <label htmlFor="size-large">Large</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="size" value="xlarge" className="nuvi-radio-custom" id="size-xlarge" />
            <label htmlFor="size-xlarge">X-Large</label>
          </div>
        </div>
      </div>

      {/* Radio Cards */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Radio Cards</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <label htmlFor="shipping-standard" style={{ 
            padding: '16px', 
            border: '2px solid #E5E7EB', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            display: 'block'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <input type="radio" name="shipping" value="standard" className="nuvi-radio-custom" id="shipping-standard" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>Standard Shipping</div>
                <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>5-7 business days</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>$5.00</div>
              </div>
            </div>
          </label>
          
          <label htmlFor="shipping-express" style={{ 
            padding: '16px', 
            border: '2px solid #8B9F7E', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            backgroundColor: 'rgba(139, 159, 126, 0.05)',
            display: 'block'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <input type="radio" name="shipping" value="express" className="nuvi-radio-custom" id="shipping-express" style={{ marginTop: '2px' }} defaultChecked />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>Express Shipping</div>
                <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>2-3 business days</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>$15.00</div>
              </div>
            </div>
          </label>
          
          <label htmlFor="shipping-overnight" style={{ 
            padding: '16px', 
            border: '2px solid #E5E7EB', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            display: 'block'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <input type="radio" name="shipping" value="overnight" className="nuvi-radio-custom" id="shipping-overnight" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>Overnight Shipping</div>
                <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Next business day</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>$25.00</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Disabled Radio Options */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Disabled Options</h3>
        <div className="nuvi-radio-group">
          <div className="nuvi-radio-item">
            <input type="radio" name="status" value="active" className="nuvi-radio-custom" id="status-active" defaultChecked />
            <label htmlFor="status-active">Active</label>
          </div>
          
          <div className="nuvi-radio-item">
            <input type="radio" name="status" value="paused" className="nuvi-radio-custom" id="status-paused" />
            <label htmlFor="status-paused">Paused</label>
          </div>
          
          <div className="nuvi-radio-item" style={{ opacity: 0.5 }}>
            <input type="radio" name="status" value="archived" className="nuvi-radio-custom" id="status-archived" disabled />
            <label htmlFor="status-archived" style={{ cursor: 'not-allowed' }}>Archived (Disabled)</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelect = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Select</h2>
      
      {/* Basic Select */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Select</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <div>
            <label className="nuvi-label">Country</label>
            <select className="nuvi-select">
              <option value="">Select a country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
          </div>
          
          <div>
            <label className="nuvi-label">Size</label>
            <select className="nuvi-select" defaultValue="medium">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>
          
          <div>
            <label className="nuvi-label">Disabled Select</label>
            <select className="nuvi-select" disabled>
              <option>Not available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Select */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Custom Select (Dropdown)</h3>
        <div style={{ maxWidth: '400px' }}>
          <label className="nuvi-label">Framework</label>
          <div style={{ position: 'relative' }}>
            <button className="nuvi-select" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Select framework</span>
              <ChevronDown size={16} />
            </button>
            <div className="nuvi-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', display: 'none' }}>
              <div className="nuvi-dropdown-item">Next.js</div>
              <div className="nuvi-dropdown-item">SvelteKit</div>
              <div className="nuvi-dropdown-item">Nuxt.js</div>
              <div className="nuvi-dropdown-item">Remix</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSwitch = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Switch</h2>
      
      {/* Basic Switch */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Switch</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div className="nuvi-switch" style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: '#E5E7EB', borderRadius: '12px', transition: 'all 0.2s' }}>
              <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
            </div>
            <span>Airplane Mode</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div className="nuvi-switch" style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: '#8B9F7E', borderRadius: '12px', transition: 'all 0.2s' }}>
              <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{ position: 'absolute', top: '2px', left: '22px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
            </div>
            <span>Notifications</span>
          </label>
        </div>
      </div>

      {/* Switch with Labels */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Switch with Labels</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div className="nuvi-switch" style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: '#E5E7EB', borderRadius: '12px', transition: 'all 0.2s', marginTop: '2px' }}>
              <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>Marketing emails</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Receive emails about new products, features, and more.</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div className="nuvi-switch" style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: '#8B9F7E', borderRadius: '12px', transition: 'all 0.2s', marginTop: '2px' }}>
              <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{ position: 'absolute', top: '2px', left: '22px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>Security alerts</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>Receive alerts about your account security.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextarea = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Textarea</h2>
      
      {/* Basic Textarea */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Textarea</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
          <div>
            <label className="nuvi-label">Description</label>
            <textarea className="nuvi-textarea" rows={4} placeholder="Enter description..."></textarea>
          </div>
          
          <div>
            <label className="nuvi-label">Comments</label>
            <textarea className="nuvi-textarea" rows={3} placeholder="Add your comments..." defaultValue="This is a textarea with content"></textarea>
          </div>
          
          <div>
            <label className="nuvi-label">Disabled</label>
            <textarea className="nuvi-textarea" rows={3} placeholder="Disabled textarea" disabled></textarea>
          </div>
        </div>
      </div>

      {/* Textarea with Character Count */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Textarea with Character Count</h3>
        <div style={{ maxWidth: '500px' }}>
          <label className="nuvi-label">Bio</label>
          <textarea className="nuvi-textarea" rows={4} placeholder="Tell us about yourself..." maxLength={200}></textarea>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#6B7280' }}>
            <span>Max 200 characters</span>
            <span>0/200</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Progress</h2>
      
      {/* Basic Progress */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Loading...</span>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>25%</span>
            </div>
            <div className="nuvi-progress-bar">
              <div className="nuvi-progress-fill" style={{ width: '25%', backgroundColor: '#8B9F7E' }}></div>
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Processing</span>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>60%</span>
            </div>
            <div className="nuvi-progress-bar">
              <div className="nuvi-progress-fill" style={{ width: '60%', backgroundColor: '#60A5FA' }}></div>
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Complete</span>
              <span style={{ fontSize: '14px', color: '#10B981' }}>100%</span>
            </div>
            <div className="nuvi-progress-bar">
              <div className="nuvi-progress-fill" style={{ width: '100%', backgroundColor: '#10B981' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Progress */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Circular Progress</h3>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg style={{ transform: 'rotate(-90deg)' }} width="80" height="80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle cx="40" cy="40" r="36" fill="none" stroke="#8B9F7E" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 36 * 0.25} ${2 * Math.PI * 36}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>25%</div>
          </div>
          
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg style={{ transform: 'rotate(-90deg)' }} width="80" height="80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle cx="40" cy="40" r="36" fill="none" stroke="#60A5FA" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 36 * 0.75} ${2 * Math.PI * 36}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>75%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Skeleton</h2>
      
      {/* Basic Skeleton */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Skeleton</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
          <div className="nuvi-skeleton" style={{ height: '16px', width: '100%' }}></div>
          <div className="nuvi-skeleton" style={{ height: '16px', width: '80%' }}></div>
          <div className="nuvi-skeleton" style={{ height: '16px', width: '60%' }}></div>
        </div>
      </div>

      {/* Card Skeleton */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Card Skeleton</h3>
        <div className="nuvi-card" style={{ maxWidth: '400px' }}>
          <div className="nuvi-card-content">
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="nuvi-skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
              <div style={{ flex: 1 }}>
                <div className="nuvi-skeleton" style={{ height: '16px', width: '150px', marginBottom: '8px' }}></div>
                <div className="nuvi-skeleton" style={{ height: '14px', width: '200px' }}></div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div className="nuvi-skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }}></div>
              <div className="nuvi-skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }}></div>
              <div className="nuvi-skeleton" style={{ height: '14px', width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* List Skeleton */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>List Skeleton</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div className="nuvi-skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }}></div>
              <div style={{ flex: 1 }}>
                <div className="nuvi-skeleton" style={{ height: '16px', width: '30%', marginBottom: '8px' }}></div>
                <div className="nuvi-skeleton" style={{ height: '14px', width: '50%' }}></div>
              </div>
              <div className="nuvi-skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpinner = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Spinner</h2>
      
      {/* Spinner Sizes */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Spinner Sizes</h3>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-spinner" style={{ width: '16px', height: '16px' }}></div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Small</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-spinner"></div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Default</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="nuvi-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Large</p>
          </div>
        </div>
      </div>

      {/* Spinner with Text */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Spinner with Text</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="nuvi-spinner"></div>
            <span>Loading...</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="nuvi-spinner" style={{ borderTopColor: '#10B981' }}></div>
            <span style={{ color: '#10B981' }}>Saving changes...</span>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Loading States</h3>
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', alignItems: 'flex-start' }}>
          <button className="nuvi-btn nuvi-btn-primary" disabled>
            <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: '8px' }} />
            Processing
          </button>
          
          {/* Dashboard Loading Button */}
          <div>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Dashboard Loading:</p>
            <div className="nuvi-btn-loading" style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#8B9F7E',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
          
          <div className="nuvi-card" style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="nuvi-spinner"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToast = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Toast</h2>
      
      {/* Toast Variants */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Toast Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          {/* Default Toast */}
          <div style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Notification</h4>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>You have a new message.</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Success Toast */}
          <div style={{ padding: '16px', backgroundColor: '#ECFDF5', border: '1px solid #10B981', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <CheckCircle size={20} style={{ color: '#10B981', marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Success!</h4>
                <p style={{ fontSize: '14px', color: '#047857' }}>Your changes have been saved.</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Error Toast */}
          <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <XCircle size={20} style={{ color: '#EF4444', marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Error</h4>
                <p style={{ fontSize: '14px', color: '#B91C1C' }}>Something went wrong. Please try again.</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast with Action */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Toast with Action</h3>
        <div style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Invitation sent</h4>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>You've sent an invite to john@example.com</p>
              <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">Undo</button>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Tabs</h2>
      
      {/* Basic Tabs */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Tabs</h3>
        <div className="nuvi-tabs">
          <div className="nuvi-tabs-list" style={{ borderBottom: '2px solid #E5E7EB', marginBottom: '24px' }}>
            <button 
              className={`nuvi-tab ${tabValue === 'account' ? 'nuvi-tab-active' : ''}`}
              onClick={() => setTabValue('account')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'account' ? '#8B9F7E' : '#6B7280',
                borderBottom: tabValue === 'account' ? '2px solid #8B9F7E' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              Account
            </button>
            <button 
              className={`nuvi-tab ${tabValue === 'password' ? 'nuvi-tab-active' : ''}`}
              onClick={() => setTabValue('password')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'password' ? '#8B9F7E' : '#6B7280',
                borderBottom: tabValue === 'password' ? '2px solid #8B9F7E' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              Password
            </button>
            <button 
              className={`nuvi-tab ${tabValue === 'team' ? 'nuvi-tab-active' : ''}`}
              onClick={() => setTabValue('team')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'team' ? '#8B9F7E' : '#6B7280',
                borderBottom: tabValue === 'team' ? '2px solid #8B9F7E' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              Team
            </button>
          </div>
          <div className="nuvi-tab-content">
            {tabValue === 'account' && (
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Account Settings</h4>
                <p style={{ color: '#6B7280' }}>Make changes to your account here. Click save when you're done.</p>
              </div>
            )}
            {tabValue === 'password' && (
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Password Settings</h4>
                <p style={{ color: '#6B7280' }}>Change your password here. After saving, you'll be logged out.</p>
              </div>
            )}
            {tabValue === 'team' && (
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Team Settings</h4>
                <p style={{ color: '#6B7280' }}>Add or remove team members here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vertical Tabs */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Vertical Tabs</h3>
        <div style={{ display: 'flex', gap: '24px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
            <button 
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: tabValue === 'general' ? 'rgba(139, 159, 126, 0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'general' ? '#8B9F7E' : '#2B2B2B',
                textAlign: 'left',
              }}
              onClick={() => setTabValue('general')}
            >
              General
            </button>
            <button 
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: tabValue === 'security' ? 'rgba(139, 159, 126, 0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'security' ? '#8B9F7E' : '#2B2B2B',
                textAlign: 'left',
              }}
              onClick={() => setTabValue('security')}
            >
              Security
            </button>
            <button 
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: tabValue === 'notifications' ? 'rgba(139, 159, 126, 0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: tabValue === 'notifications' ? '#8B9F7E' : '#2B2B2B',
                textAlign: 'left',
              }}
              onClick={() => setTabValue('notifications')}
            >
              Notifications
            </button>
          </div>
          <div style={{ flex: 1, padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
            {tabValue === 'general' && <p>General settings content</p>}
            {tabValue === 'security' && <p>Security settings content</p>}
            {tabValue === 'notifications' && <p>Notifications settings content</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreadcrumb = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Breadcrumb</h2>
      
      {/* Basic Breadcrumb */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Breadcrumb</h3>
        <nav className="nuvi-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</a>
          <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Products</a>
          <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
          <span style={{ color: '#2B2B2B' }}>Wireless Headphones</span>
        </nav>
      </div>

      {/* Breadcrumb with Icons */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Breadcrumb with Icons</h3>
        <nav className="nuvi-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Home size={16} />
            Home
          </a>
          <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Package size={16} />
            Products
          </a>
          <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
          <span style={{ color: '#2B2B2B' }}>Details</span>
        </nav>
      </div>

      {/* Custom Separator */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Custom Separator</h3>
        <nav className="nuvi-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Dashboard</a>
          <span style={{ color: '#9CA3AF' }}>/</span>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }}>Settings</a>
          <span style={{ color: '#9CA3AF' }}>/</span>
          <span style={{ color: '#2B2B2B' }}>Profile</span>
        </nav>
      </div>
    </div>
  );

  const renderDropdown = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Dropdown Menu</h2>
      
      {/* Basic Dropdown */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Dropdown</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button className="nuvi-btn nuvi-btn-secondary">
            Options
            <ChevronDown size={16} style={{ marginLeft: '8px' }} />
          </button>
          <div className="nuvi-dropdown" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', minWidth: '200px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '4px', display: 'block' }}>
            <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} />
              Profile
            </button>
            <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} />
              Settings
            </button>
            <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} />
              Notifications
            </button>
            <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }}></div>
            <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown with Sections */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Dropdown with Sections</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button className="nuvi-btn nuvi-btn-secondary">
            <User size={16} style={{ marginRight: '8px' }} />
            Account
            <ChevronDown size={16} style={{ marginLeft: '8px' }} />
          </button>
          <div className="nuvi-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '250px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'block' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
              <p style={{ fontWeight: '600', margin: 0 }}>John Doe</p>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>john@example.com</p>
            </div>
            <div style={{ padding: '4px' }}>
              <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' }}>
                Dashboard
              </button>
              <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' }}>
                Settings
              </button>
              <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' }}>
                Billing
              </button>
            </div>
            <div style={{ padding: '4px', borderTop: '1px solid #E5E7EB' }}>
              <button className="nuvi-dropdown-item" style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' }}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Pagination</h2>
      
      {/* Basic Pagination */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Pagination</h3>
        <div className="nuvi-pagination" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm" disabled>
            <ChevronLeft size={16} />
            Previous
          </button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="nuvi-pagination-item nuvi-pagination-item-active" style={{ width: '32px', height: '32px', border: '1px solid #8B9F7E', backgroundColor: '#8B9F7E', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>1</button>
            <button className="nuvi-pagination-item" style={{ width: '32px', height: '32px', border: '1px solid #E5E7EB', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>2</button>
            <button className="nuvi-pagination-item" style={{ width: '32px', height: '32px', border: '1px solid #E5E7EB', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>3</button>
            <span className="nuvi-pagination-ellipsis" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</span>
            <button className="nuvi-pagination-item" style={{ width: '32px', height: '32px', border: '1px solid #E5E7EB', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>9</button>
            <button className="nuvi-pagination-item" style={{ width: '32px', height: '32px', border: '1px solid #E5E7EB', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>10</button>
          </div>
          <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Simple Pagination */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Simple Pagination</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px' }}>Page 1 of 10</span>
          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Pagination with Info */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Pagination with Info</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '600px' }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Showing 1 to 10 of 97 results</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">Previous</button>
            <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDialog = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Dialog / Modal</h2>
      
      {/* Dialog Example */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Dialog Example</h3>
        <button className="nuvi-btn nuvi-btn-primary" onClick={() => setDialogOpen(true)}>Open Dialog</button>
        
        {/* Static Preview */}
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>Dialog Preview (Static):</p>
          <div className="nuvi-dialog" style={{ position: 'relative', maxWidth: '500px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="nuvi-dialog-header" style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Edit profile</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Make changes to your profile here. Click save when you're done.</p>
            </div>
            <div className="nuvi-dialog-content" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="nuvi-label">Name</label>
                  <input type="text" className="nuvi-input" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="nuvi-label">Username</label>
                  <input type="text" className="nuvi-input" defaultValue="@johndoe" />
                </div>
              </div>
            </div>
            <div className="nuvi-dialog-footer" style={{ padding: '24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="nuvi-btn nuvi-btn-secondary">Cancel</button>
              <button className="nuvi-btn nuvi-btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Alert Dialog</h3>
        <button className="nuvi-btn nuvi-btn-danger">Delete Account</button>
        
        {/* Static Preview */}
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>Alert Dialog Preview (Static):</p>
          <div className="nuvi-dialog" style={{ position: 'relative', maxWidth: '400px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <AlertTriangle size={24} style={{ color: '#EF4444' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Are you absolutely sure?</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="nuvi-btn nuvi-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button className="nuvi-btn nuvi-btn-danger" style={{ flex: 1 }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTooltip = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Tooltip</h2>
      
      {/* Tooltip Positions */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Tooltip Positions</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-secondary">Top</button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', whiteSpace: 'nowrap' }}>Tooltip on top</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-secondary">Right</button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px', whiteSpace: 'nowrap' }}>Tooltip on right</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-secondary">Bottom</button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', whiteSpace: 'nowrap' }}>Tooltip on bottom</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-secondary">Left</button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px', whiteSpace: 'nowrap' }}>Tooltip on left</div>
          </div>
        </div>
      </div>

      {/* Tooltip Triggers */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Tooltip Triggers</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'help' }}>Hover me</span>
            <div className="nuvi-tooltip" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}>Helpful information</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only">
              <HelpCircle size={16} />
            </button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}>More info</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only" disabled>
              <Lock size={16} />
            </button>
            <div className="nuvi-tooltip" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}>This action is locked</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    const handleSelectAll = () => {
      if (selectAll) {
        setSelectedRows([]);
        setSelectAll(false);
      } else {
        setSelectedRows(['1', '2', '3', '4', '5', '6', '7', '8']);
        setSelectAll(true);
      }
    };

    const handleSelectRow = (id: string) => {
      if (selectedRows.includes(id)) {
        setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        setSelectAll(false);
      } else {
        const newSelected = [...selectedRows, id];
        setSelectedRows(newSelected);
        if (newSelected.length === 8) {
          setSelectAll(true);
        }
      }
    };
    
    const handleExpandRow = (id: string) => {
      if (expandedRows.includes(id)) {
        setExpandedRows(expandedRows.filter(rowId => rowId !== id));
      } else {
        setExpandedRows([...expandedRows, id]);
      }
    };

    return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Table</h2>
      
      {/* Table with Selection */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Table with Bulk Selection</h3>
        {selectedRows.length > 0 && (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#F4F7F2', 
            borderRadius: '6px', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #D4E4CD'
          }}>
            <span style={{ fontSize: '13px', color: '#5A6E50', fontWeight: '500' }}>
              {selectedRows.length} items selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="nuvi-btn nuvi-btn-xs nuvi-btn-secondary">
                <Download size={12} style={{ marginRight: '4px' }} />
                Export
              </button>
              <button className="nuvi-btn nuvi-btn-xs nuvi-btn-destructive">
                <Trash2 size={12} style={{ marginRight: '4px' }} />
                Delete
              </button>
            </div>
          </div>
        )}
        <div className="nuvi-card" style={{ overflow: 'hidden' }}>
          <table className="nuvi-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ fontSize: '12px' }}>
                <th style={{ width: '40px', padding: '6px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('1') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('1')}
                    onChange={() => handleSelectRow('1')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>John Doe</td>
                <td style={{ padding: '8px 12px' }}>john@example.com</td>
                <td style={{ padding: '8px 12px' }}>Admin</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('2') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('2')}
                    onChange={() => handleSelectRow('2')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Jane Smith</td>
                <td style={{ padding: '8px 12px' }}>jane@example.com</td>
                <td style={{ padding: '8px 12px' }}>User</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('3') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('3')}
                    onChange={() => handleSelectRow('3')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Bob Johnson</td>
                <td style={{ padding: '8px 12px' }}>bob@example.com</td>
                <td style={{ padding: '8px 12px' }}>User</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-warning">Pending</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('4') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('4')}
                    onChange={() => handleSelectRow('4')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Alice Cooper</td>
                <td style={{ padding: '8px 12px' }}>alice@example.com</td>
                <td style={{ padding: '8px 12px' }}>Manager</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('5') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('5')}
                    onChange={() => handleSelectRow('5')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>David Wilson</td>
                <td style={{ padding: '8px 12px' }}>david@example.com</td>
                <td style={{ padding: '8px 12px' }}>User</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">Inactive</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('6') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('6')}
                    onChange={() => handleSelectRow('6')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Emma Brown</td>
                <td style={{ padding: '8px 12px' }}>emma@example.com</td>
                <td style={{ padding: '8px 12px' }}>Admin</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('7') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('7')}
                    onChange={() => handleSelectRow('7')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Frank Miller</td>
                <td style={{ padding: '8px 12px' }}>frank@example.com</td>
                <td style={{ padding: '8px 12px' }}>User</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: selectedRows.includes('8') ? '#F4F7F2' : 'transparent' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input 
                    type="checkbox"
                    className="nuvi-checkbox-custom" 
                    checked={selectedRows.includes('8')}
                    onChange={() => handleSelectRow('8')}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>Grace Lee</td>
                <td style={{ padding: '8px 12px' }}>grace@example.com</td>
                <td style={{ padding: '8px 12px' }}>Manager</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-warning">Pending</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Striped Table */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Striped Table</h3>
        <div className="nuvi-card" style={{ overflow: 'hidden' }}>
          <table className="nuvi-table nuvi-table-striped" style={{ width: '100%' }}>
            <thead>
              <tr style={{ fontSize: '12px' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: '600' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: '600' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#F9FAFB', fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Wireless Headphones</td>
                <td style={{ padding: '8px 12px' }}>Electronics</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$129.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>45</td>
              </tr>
              <tr style={{ fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Smart Watch</td>
                <td style={{ padding: '8px 12px' }}>Electronics</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$299.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>23</td>
              </tr>
              <tr style={{ backgroundColor: '#F9FAFB', fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Running Shoes</td>
                <td style={{ padding: '8px 12px' }}>Sports</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$89.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>67</td>
              </tr>
              <tr style={{ fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Laptop Stand</td>
                <td style={{ padding: '8px 12px' }}>Accessories</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$49.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>120</td>
              </tr>
              <tr style={{ backgroundColor: '#F9FAFB', fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Yoga Mat</td>
                <td style={{ padding: '8px 12px' }}>Sports</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$29.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>85</td>
              </tr>
              <tr style={{ fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Coffee Maker</td>
                <td style={{ padding: '8px 12px' }}>Kitchen</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$179.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>32</td>
              </tr>
              <tr style={{ backgroundColor: '#F9FAFB', fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Desk Lamp</td>
                <td style={{ padding: '8px 12px' }}>Furniture</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$39.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>58</td>
              </tr>
              <tr style={{ fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>Water Bottle</td>
                <td style={{ padding: '8px 12px' }}>Accessories</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>$19.99</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Product Table with Images */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Product Table with Images</h3>
        <div className="nuvi-card" style={{ overflow: 'hidden' }}>
          <table className="nuvi-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ fontSize: '12px' }}>
                <th style={{ width: '40px', padding: '6px 12px' }}>
                  <input type="checkbox" className="nuvi-checkbox-custom" />
                </th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontSize: '13px' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input type="checkbox" className="nuvi-checkbox-custom" />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#F3F4F6', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={20} color="#9CA3AF" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Wireless Headphones</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>SKU: WH-001</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">Electronics</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: '500' }}>145</span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>in stock</span>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontWeight: '500' }}>$89.99</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="View">
                      <Eye size={14} />
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr style={{ fontSize: '13px', backgroundColor: '#F9FAFB' }}>
                <td style={{ padding: '8px 12px' }}>
                  <input type="checkbox" className="nuvi-checkbox-custom" />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#FEF3C7', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={20} color="#F59E0B" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Cotton T-Shirt</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>SKU: CT-042</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-secondary">Clothing</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#DC2626' }}>12</span>
                    <span style={{ fontSize: '11px', color: '#DC2626' }}>low stock</span>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontWeight: '500' }}>$24.99</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Active</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="View">
                      <Eye size={14} />
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable Rows Table */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Table with Expandable Rows</h3>
        <div className="nuvi-card" style={{ overflow: 'hidden' }}>
          <table className="nuvi-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ fontSize: '12px' }}>
                <th style={{ width: '40px', padding: '6px 12px' }}></th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {['ORD-001', 'ORD-002', 'ORD-003'].map(orderId => (
                <React.Fragment key={orderId}>
                  <tr style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => handleExpandRow(orderId)}>
                    <td style={{ padding: '8px 12px' }}>
                      <ChevronRight 
                        size={14} 
                        style={{
                          transform: expandedRows.includes(orderId) ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: '500' }}>{orderId}</td>
                    <td style={{ padding: '8px 12px' }}>John Doe</td>
                    <td style={{ padding: '8px 12px' }}>Jan 15, 2024</td>
                    <td style={{ padding: '8px 12px', fontWeight: '500' }}>$245.99</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="nuvi-badge nuvi-badge-sm nuvi-badge-success">Delivered</span>
                    </td>
                  </tr>
                  {expandedRows.includes(orderId) && (
                    <tr>
                      <td colSpan={6} style={{ padding: '0' }}>
                        <div style={{ 
                          padding: '16px 24px', 
                          backgroundColor: '#F9FAFB',
                          borderTop: '1px solid #E5E7EB',
                          borderBottom: '1px solid #E5E7EB'
                        }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Order Items</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span>Wireless Headphones × 1</span>
                              <span style={{ fontWeight: '500' }}>$89.99</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span>Cotton T-Shirt × 2</span>
                              <span style={{ fontWeight: '500' }}>$49.98</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span>Running Shoes × 1</span>
                              <span style={{ fontWeight: '500' }}>$106.02</span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '12px',
                              paddingTop: '8px',
                              borderTop: '1px solid #E5E7EB',
                              fontWeight: '600'
                            }}>
                              <span>Total</span>
                              <span>$245.99</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Table with Filters */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Data Table with Filters</h3>
        <div className="nuvi-card">
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input 
                  type="text"
                  placeholder="Search customers..."
                  style={{
                    padding: '6px 8px 6px 32px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
              </div>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
                <Filter size={12} style={{ marginRight: '4px' }} />
                Filters
              </button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
                <SortAsc size={12} style={{ marginRight: '4px' }} />
                Sort
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="nuvi-btn nuvi-btn-xs nuvi-btn-secondary">
                <Download size={12} style={{ marginRight: '4px' }} />
                Export
              </button>
              <button className="nuvi-btn nuvi-btn-xs nuvi-btn-primary">
                <Plus size={12} style={{ marginRight: '4px' }} />
                Add Customer
              </button>
            </div>
          </div>
          <table className="nuvi-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ fontSize: '12px' }}>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Orders</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Total Spent</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: '600' }}>Last Order</th>
                <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sarah Johnson', email: 'sarah@example.com', orders: 24, spent: '$2,459.99', lastOrder: '2 days ago' },
                { name: 'Mike Wilson', email: 'mike@example.com', orders: 12, spent: '$1,234.56', lastOrder: '1 week ago' },
                { name: 'Emma Davis', email: 'emma@example.com', orders: 8, spent: '$567.89', lastOrder: '2 weeks ago' },
                { name: 'James Brown', email: 'james@example.com', orders: 31, spent: '$3,456.78', lastOrder: 'Yesterday' },
              ].map((customer, idx) => (
                <tr key={idx} style={{ fontSize: '13px' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: '500' }}>{customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>{customer.email}</td>
                  <td style={{ padding: '8px 12px' }}>{customer.orders}</td>
                  <td style={{ padding: '8px 12px', fontWeight: '500' }}>{customer.spent}</td>
                  <td style={{ padding: '8px 12px', color: '#6B7280', fontSize: '12px' }}>{customer.lastOrder}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}>
            <span style={{ color: '#6B7280' }}>Showing 1-4 of 156 results</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs" disabled>
                <ChevronLeft size={14} />
              </button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs nuvi-btn-active">1</button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">2</button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">3</button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">...</button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">39</button>
              <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Advanced Components
  const renderSheet = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Sheet</h2>
      
      {/* Sheet from different sides */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sheet Positions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSheetOpen(true)}
            className="nuvi-btn nuvi-btn-primary"
            style={{ padding: '8px 16px' }}
          >
            Open Right Sheet
          </button>
          <button
            className="nuvi-btn nuvi-btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            Open Left Sheet
          </button>
          <button
            className="nuvi-btn nuvi-btn-outline"
            style={{ padding: '8px 16px' }}
          >
            Open Top Sheet
          </button>
          <button
            className="nuvi-btn nuvi-btn-ghost"
            style={{ padding: '8px 16px' }}
          >
            Open Bottom Sheet
          </button>
        </div>
      </div>

      {/* Sheet Demo */}
      {sheetOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={() => setSheetOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '400px',
              backgroundColor: 'white',
              boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Edit Profile</h3>
              <button
                onClick={() => setSheetOpen(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Name
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  defaultValue="John Doe"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="nuvi-input"
                  defaultValue="john@example.com"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Bio
                </label>
                <textarea
                  className="nuvi-textarea"
                  rows={4}
                  style={{ width: '100%' }}
                  defaultValue="Software developer passionate about building great products."
                />
              </div>
            </div>
            <div style={{ 
              padding: '24px', 
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSheetOpen(false)}
                className="nuvi-btn nuvi-btn-secondary"
              >
                Cancel
              </button>
              <button className="nuvi-btn nuvi-btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPopover = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Popover</h2>
      
      {/* Basic Popover */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Popover</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className="nuvi-btn nuvi-btn-outline"
            >
              Click for Popover
            </button>
            {popoverOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  width: '300px',
                  zIndex: 10,
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Popover Title
                </h4>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                  This is a popover content. You can put any content here.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="nuvi-btn nuvi-btn-sm nuvi-btn-primary">Confirm</button>
                  <button 
                    onClick={() => setPopoverOpen(false)}
                    className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popover with Form */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Popover with Form</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button className="nuvi-btn nuvi-btn-primary">
            <Settings size={16} style={{ marginRight: '8px' }} />
            Settings
          </button>
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              width: '320px',
              display: 'none',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Width
              </label>
              <input type="text" className="nuvi-input" placeholder="100%" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Max Width
              </label>
              <input type="text" className="nuvi-input" placeholder="300px" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Height
              </label>
              <input type="text" className="nuvi-input" placeholder="25px" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommandPalette = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Command Palette</h2>
      
      {/* Command Palette Demo */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Command Palette</h3>
        <button
          onClick={() => setCommandOpen(true)}
          className="nuvi-btn nuvi-btn-outline"
        >
          <Command size={16} style={{ marginRight: '8px' }} />
          Open Command Palette (⌘K)
        </button>
      </div>

      {/* Command Palette Modal */}
      {commandOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={() => setCommandOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              zIndex: 1001,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                  SUGGESTIONS
                </div>
                {[
                  { icon: Search, label: 'Search Products', shortcut: '⌘P' },
                  { icon: FileText, label: 'Search Documentation', shortcut: '⌘D' },
                  { icon: Settings, label: 'Open Settings', shortcut: '⌘,' },
                  { icon: User, label: 'View Profile', shortcut: '⌘U' },
                  { icon: Bell, label: 'View Notifications', shortcut: '⌘N' },
                ].map((item, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: index === 0 ? '#F3F4F6' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index === 0 ? '#F3F4F6' : 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={18} style={{ color: '#6B7280' }} />
                      <span style={{ fontSize: '14px' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.shortcut}</span>
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', padding: '8px 12px' }}>
                  RECENT
                </div>
                {[
                  { icon: Package, label: 'Product: Wireless Headphones' },
                  { icon: Users, label: 'Customer: John Doe' },
                  { icon: ShoppingCart, label: 'Order: #12345' },
                ].map((item, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <item.icon size={18} style={{ color: '#6B7280' }} />
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderContextMenu = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Context Menu</h2>
      
      {/* Context Menu Demo */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Right Click Context Menu</h3>
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenuOpen(true);
          }}
          style={{
            padding: '48px',
            border: '2px dashed #E5E7EB',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            position: 'relative',
            cursor: 'context-menu',
          }}
        >
          <p style={{ color: '#6B7280' }}>Right-click anywhere in this area to open context menu</p>
          
          {contextMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '4px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                zIndex: 10,
              }}
              onMouseLeave={() => setContextMenuOpen(false)}
            >
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Edit size={16} />
                Edit
              </button>
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Copy size={16} />
                Copy
              </button>
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Clipboard size={16} />
                Paste
              </button>
              <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px', color: '#EF4444' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDatePicker = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Date Picker</h2>
      
      {/* Basic Date Picker */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Date Picker</h3>
        <div style={{ maxWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Select Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="nuvi-input"
              value={selectedDate.toLocaleDateString()}
              readOnly
              style={{ width: '100%', paddingRight: '40px', cursor: 'pointer' }}
            />
            <Calendar size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          </div>
        </div>
      </div>

      {/* Date Range Picker */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Date Range Picker</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', maxWidth: '500px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              className="nuvi-input"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ paddingTop: '24px' }}>
            <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#6B7280' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              End Date
            </label>
            <input
              type="date"
              className="nuvi-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Time Picker */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Time Picker</h3>
        <div style={{ maxWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Select Time
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="time"
              className="nuvi-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSlider = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Slider</h2>
      
      {/* Basic Slider */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Slider</h3>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Volume</label>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>{sliderValue[0]}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue[0]}
            onChange={(e) => setSliderValue([parseInt(e.target.value)])}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #8B9F7E 0%, #8B9F7E ${sliderValue[0]}%, #E5E7EB ${sliderValue[0]}%, #E5E7EB 100%)`,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Slider with Steps */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Slider with Steps</h3>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Price Range</label>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>${sliderValue[0] * 10}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={sliderValue[0]}
            onChange={(e) => setSliderValue([parseInt(e.target.value)])}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #8B9F7E 0%, #8B9F7E ${sliderValue[0]}%, #E5E7EB ${sliderValue[0]}%, #E5E7EB 100%)`,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>$0</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>$1000</span>
          </div>
        </div>
      </div>

      {/* Disabled Slider */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Disabled Slider</h3>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#9CA3AF' }}>Brightness (Disabled)</label>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value="30"
            disabled
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'linear-gradient(to right, #D1D5DB 0%, #D1D5DB 30%, #F3F4F6 30%, #F3F4F6 100%)',
              outline: 'none',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderScrollArea = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Scroll Area</h2>
      
      {/* Vertical Scroll Area */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Vertical Scroll Area</h3>
        <div
          style={{
            height: '200px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Horizontal Scroll Area</h3>
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflowX: 'auto',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '150px',
                  height: '100px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6B7280',
                }}
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Both Directions Scroll Area */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Both Directions Scroll Area</h3>
        <div
          style={{
            height: '300px',
            width: '100%',
            maxWidth: '600px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'auto',
            padding: '16px',
          }}
        >
          <table style={{ minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, backgroundColor: 'white' }}>ID</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(20)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px', position: 'sticky', left: 0, backgroundColor: 'white' }}>#{i + 1001}</td>
                  <td style={{ padding: '8px' }}>Employee {i + 1}</td>
                  <td style={{ padding: '8px' }}>employee{i + 1}@example.com</td>
                  <td style={{ padding: '8px' }}>Engineering</td>
                  <td style={{ padding: '8px' }}>Developer</td>
                  <td style={{ padding: '8px' }}>Active</td>
                  <td style={{ padding: '8px' }}>2024-01-{String(i + 1).padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNavigationMenu = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Navigation Menu</h2>
      
      {/* Horizontal Navigation Menu */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Horizontal Navigation</h3>
        <nav style={{ borderBottom: '1px solid #E5E7EB' }}>
          <ul style={{ display: 'flex', gap: '24px', listStyle: 'none', margin: 0, padding: 0 }}>
            {['Products', 'Solutions', 'Resources', 'Pricing', 'Company'].map((item, index) => (
              <li key={index}>
                <button
                  style={{
                    padding: '16px 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: index === 0 ? '#8B9F7E' : '#2B2B2B',
                    borderBottom: index === 0 ? '2px solid #8B9F7E' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Compact Vertical Navigation Menu */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Compact Sidebar Navigation</h3>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Compact Sidebar Navigation */}
          <nav style={{ 
            width: sidebarCollapsed ? '64px' : '220px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px', 
            padding: '6px',
            transition: 'width 0.2s',
            position: 'relative',
            backgroundColor: 'white'
          }}>
            {/* Store Selector */}
            <div style={{ 
              padding: '6px', 
              marginBottom: '6px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              {!sidebarCollapsed ? (
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}>
                  <Store size={14} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>My Store</span>
                  <ChevronDown size={12} style={{ marginLeft: 'auto' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px' }}>
                  <Store size={18} />
                </div>
              )}
            </div>

            {/* Navigation Items */}
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { 
                id: 'products', 
                icon: Package, 
                label: 'Products',
                subItems: [
                  { id: 'all-products', label: 'All Products' },
                  { id: 'add-product', label: 'Add Product' },
                  { id: 'categories', label: 'Categories' },
                  { id: 'inventory', label: 'Inventory' }
                ]
              },
              { 
                id: 'orders', 
                icon: ShoppingCart, 
                label: 'Orders',
                subItems: [
                  { id: 'all-orders', label: 'All Orders' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'returns', label: 'Returns' }
                ]
              },
              { id: 'customers', icon: Users, label: 'Customers' },
              {
                id: 'marketing',
                icon: Megaphone,
                label: 'Marketing',
                subItems: [
                  { id: 'campaigns', label: 'Campaigns' },
                  { id: 'discounts', label: 'Discounts' },
                  { id: 'automations', label: 'Automations' }
                ]
              },
              {
                id: 'content',
                icon: FileText,
                label: 'Content',
                subItems: [
                  { id: 'pages', label: 'Pages' },
                  { id: 'blogs', label: 'Blogs' },
                  { id: 'media', label: 'Media' },
                  { id: 'menus', label: 'Menus' }
                ]
              },
              { id: 'analytics', icon: BarChart, label: 'Analytics' },
              { 
                id: 'settings', 
                icon: Settings, 
                label: 'Settings',
                subItems: [
                  { id: 'general', label: 'General' },
                  { id: 'payment', label: 'Payment' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'taxes', label: 'Taxes' }
                ]
              },
            ].map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setActiveNavItem(item.id);
                    if (item.subItems) {
                      setExpandedMenus(prev => 
                        prev.includes(item.id) 
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: sidebarCollapsed ? '10px' : '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: activeNavItem === item.id ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeNavItem === item.id ? '#8B9F7E' : '#2B2B2B',
                    fontSize: '13px',
                    fontWeight: activeNavItem === item.id ? '500' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    position: 'relative',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (activeNavItem !== item.id) e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    if (activeNavItem !== item.id) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon size={16} />
                  {!sidebarCollapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                      {item.subItems && (
                        <ChevronDown 
                          size={12} 
                          style={{ 
                            transform: expandedMenus.includes(item.id) ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </>
                  )}
                </button>
                
                {/* Sub Items */}
                {!sidebarCollapsed && item.subItems && expandedMenus.includes(item.id) && (
                  <div style={{ 
                    marginLeft: '26px', 
                    marginTop: '2px',
                    paddingLeft: '4px',
                    borderLeft: '2px solid #f3f4f6',
                    marginBottom: '4px'
                  }}>
                    {item.subItems.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveNavItem(subItem.id)}
                        style={{
                          width: 'calc(100% - 4px)',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: activeNavItem === subItem.id ? 'rgba(139, 159, 126, 0.05)' : 'transparent',
                          color: activeNavItem === subItem.id ? '#8B9F7E' : '#6B7280',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (activeNavItem !== subItem.id) e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          if (activeNavItem !== subItem.id) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                position: 'absolute',
                right: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <ChevronDown 
                size={14} 
                style={{ 
                  transform: sidebarCollapsed ? 'rotate(-90deg)' : 'rotate(90deg)',
                  transition: 'transform 0.2s'
                }} 
              />
            </button>
          </nav>

          {/* Demo Content */}
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            backgroundColor: '#F9FAFB', 
            borderRadius: '8px',
            minHeight: '400px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Active: {activeNavItem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Click on navigation items to see them become active. Items with arrows have sub-menus.
              Click the toggle button on the sidebar edge to collapse/expand.
            </p>
            
            <div style={{ marginTop: '24px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Features:</h5>
              <ul style={{ fontSize: '13px', color: '#6B7280', paddingLeft: '20px' }}>
                <li>Collapsible sidebar with smooth animation</li>
                <li>Multi-level navigation with sub-menus</li>
                <li>Active state highlighting</li>
                <li>Hover effects</li>
                <li>Store selector dropdown</li>
                <li>Tooltip on collapsed state</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Additional Missing Components
  const renderAlertDialog = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Alert Dialog</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Alert Dialog Demo</h3>
        <button
          onClick={() => setAlertDialogOpen(true)}
          className="nuvi-btn nuvi-btn-destructive"
        >
          Delete Account
        </button>
      </div>

      {/* Alert Dialog */}
      {alertDialogOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              zIndex: 1001,
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Are you absolutely sure?
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAlertDialogOpen(false)}
                className="nuvi-btn nuvi-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setAlertDialogOpen(false)}
                className="nuvi-btn nuvi-btn-destructive"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCollapsible = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Collapsible</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Collapsible Content</h3>
        <div style={{ maxWidth: '600px', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
          <button
            onClick={() => setCollapsibleOpen(!collapsibleOpen)}
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <span>@peduarte starred 3 repositories</span>
            <ChevronDown
              size={16}
              style={{
                transform: collapsibleOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
          {collapsibleOpen && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <div style={{ marginBottom: '8px', padding: '8px', borderRadius: '6px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>@radix-ui/primitives</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Radix Primitives</div>
              </div>
              <div style={{ marginBottom: '8px', padding: '8px', borderRadius: '6px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>@radix-ui/colors</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Radix Colors</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>@stitches/react</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>CSS-in-JS library</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHoverCard = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Hover Card</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Hover Card Demo</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onMouseEnter={() => setHoverCardOpen(true)}
            onMouseLeave={() => setHoverCardOpen(false)}
            className="nuvi-btn nuvi-btn-link"
            style={{ fontSize: '14px', textDecoration: 'underline' }}
          >
            @nextjs
          </button>
          {hoverCardOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                width: '320px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#000' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Next.js</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                    The React Framework – created and maintained by @vercel.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      Joined December 2021
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderToggle = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Toggle</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Toggle Buttons</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setToggleValue(!toggleValue)}
            style={{
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: toggleValue ? '#8B9F7E' : 'white',
              color: toggleValue ? 'white' : '#2B2B2B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Bold size={16} />
            Bold
          </button>
          <button
            style={{
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Italic size={16} />
            Italic
          </button>
          <button
            style={{
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Underline size={16} />
            Underline
          </button>
        </div>
      </div>

      {/* Toggle Group */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Toggle Group</h3>
        <div style={{ display: 'inline-flex', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '2px' }}>
          {['bold', 'italic', 'underline'].map((item) => (
            <button
              key={item}
              onClick={() => setToggleGroupValue(item)}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: toggleGroupValue === item ? '#8B9F7E' : 'transparent',
                color: toggleGroupValue === item ? 'white' : '#2B2B2B',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '14px',
              }}
            >
              {item === 'bold' && <Bold size={14} />}
              {item === 'italic' && <Italic size={14} />}
              {item === 'underline' && <Underline size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSeparator = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Separator</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Horizontal Separator</h3>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Radix Primitives</h4>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>An open-source UI component library.</p>
          </div>
          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '24px 0' }} />
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <span>Blog</span>
            <span style={{ color: '#6B7280' }}>•</span>
            <span>Docs</span>
            <span style={{ color: '#6B7280' }}>•</span>
            <span>Source</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Vertical Separator</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>Home</span>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB' }} />
          <span style={{ fontSize: '14px' }}>About</span>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB' }} />
          <span style={{ fontSize: '14px' }}>Contact</span>
        </div>
      </div>
    </div>
  );

  const renderAspectRatio = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Aspect Ratio</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>16:9 Aspect Ratio</h3>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={48} style={{ color: '#9CA3AF' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Square (1:1) Aspect Ratio</h3>
        <div style={{ maxWidth: '200px' }}>
          <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={48} style={{ color: '#9CA3AF' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInputOTP = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Input OTP</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>One-Time Password Input</h3>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Enter your one-time password
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="nuvi-input"
                style={{
                  width: '48px',
                  height: '48px',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: '500',
                }}
                onChange={(e) => {
                  if (e.target.value && i < 5) {
                    const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                    const prevInput = e.currentTarget.parentElement?.children[i - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Carousel</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Image Carousel</h3>
        <div style={{ maxWidth: '600px', position: 'relative' }}>
          <div style={{ overflow: 'hidden', borderRadius: '8px' }}>
            <div style={{ display: 'flex', transition: 'transform 0.3s' }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  style={{
                    minWidth: '100%',
                    height: '300px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#9CA3AF',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <button
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCombobox = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Combobox</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Searchable Select</h3>
        <div style={{ maxWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Select Framework
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="nuvi-input"
              placeholder="Search framework..."
              style={{ width: '100%', paddingRight: '32px' }}
            />
            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          </div>
          <div style={{
            marginTop: '4px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: 'white',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Gatsby', 'Astro'].map((item) => (
              <button
                key={item}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMenubar = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Menubar</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Application Menubar</h3>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '4px', display: 'inline-flex', gap: '4px' }}>
          {['File', 'Edit', 'View', 'Window', 'Help'].map((menu) => (
            <button
              key={menu}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {menu}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Sidebar</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sidebar Navigation</h3>
        <div style={{ display: 'flex', height: '400px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ width: '240px', backgroundColor: '#F9FAFB', padding: '16px', borderRight: '1px solid #E5E7EB' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Platform</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Playground', 'Projects', 'Templates', 'Documentation'].map((item, index) => (
                  <button
                    key={item}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: index === 0 ? 'white' : 'transparent',
                      boxShadow: index === 0 ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div style={{ flex: 1, padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Content Area</h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Main content goes here. The sidebar provides navigation and the content area displays the selected page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResizable = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Resizable</h2>
      
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Resizable Panels</h3>
        <div style={{ display: 'flex', height: '200px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ 
            width: '50%', 
            backgroundColor: '#F3F4F6', 
            padding: '16px',
            borderRight: '2px solid #8B9F7E',
            cursor: 'col-resize',
            position: 'relative',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Panel 1</div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Drag the border to resize</p>
          </div>
          <div style={{ flex: 1, padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Panel 2</div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>This panel will adjust automatically</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrawer = () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Drawer</h2>
      
      {/* Drawer is similar to Sheet but using different terminology */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Drawer Variations</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="nuvi-btn nuvi-btn-primary"
          >
            Open Drawer
          </button>
          <button className="nuvi-btn nuvi-btn-secondary">
            Drawer with Footer
          </button>
          <button className="nuvi-btn nuvi-btn-outline">
            Full Height Drawer
          </button>
        </div>
      </div>

      {/* Drawer with Form Example */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Drawer Use Cases</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <Sliders size={24} style={{ marginBottom: '8px', color: '#8B9F7E' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Filters Drawer</h4>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Show product filters</p>
          </div>
          <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <ShoppingCart size={24} style={{ marginBottom: '8px', color: '#8B9F7E' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Cart Drawer</h4>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Shopping cart sidebar</p>
          </div>
          <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <Menu size={24} style={{ marginBottom: '8px', color: '#8B9F7E' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Mobile Menu</h4>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Navigation drawer</p>
          </div>
        </div>
      </div>

      {/* Drawer Demo */}
      {drawerOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: '300px',
              backgroundColor: 'white',
              boxShadow: '4px 0 16px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Navigation</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: Home, label: 'Dashboard' },
                  { icon: Package, label: 'Products' },
                  { icon: Users, label: 'Customers' },
                  { icon: ShoppingCart, label: 'Orders' },
                  { icon: BarChart, label: 'Analytics' },
                  { icon: Settings, label: 'Settings' },
                ].map((item, index) => (
                  <button
                    key={index}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: index === 0 ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                      color: index === 0 ? '#8B9F7E' : '#2B2B2B',
                      fontSize: '14px',
                      fontWeight: index === 0 ? '500' : '400',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (index !== 0) e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      if (index !== 0) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'accordion':
        return renderAccordion();
      case 'alert':
        return renderAlert();
      case 'avatar':
        return renderAvatar();
      case 'badge':
        return renderBadge();
      case 'button':
        return renderButton();
      case 'card':
        return renderCard();
      case 'checkbox':
        return renderCheckbox();
      case 'input':
        return renderInput();
      case 'radio':
        return renderRadio();
      case 'select':
        return renderSelect();
      case 'switch':
        return renderSwitch();
      case 'textarea':
        return renderTextarea();
      case 'progress':
        return renderProgress();
      case 'skeleton':
        return renderSkeleton();
      case 'spinner':
        return renderSpinner();
      case 'toast':
        return renderToast();
      case 'tabs':
        return renderTabs();
      case 'breadcrumb':
        return renderBreadcrumb();
      case 'dropdown':
        return renderDropdown();
      case 'pagination':
        return renderPagination();
      case 'dialog':
        return renderDialog();
      case 'tooltip':
        return renderTooltip();
      case 'table':
        return renderTable();
      case 'sheet':
        return renderSheet();
      case 'popover':
        return renderPopover();
      case 'command':
      case 'command-palette':
        return renderCommandPalette();
      case 'context-menu':
        return renderContextMenu();
      case 'date-picker':
        return renderDatePicker();
      case 'slider':
        return renderSlider();
      case 'scroll-area':
        return renderScrollArea();
      case 'navigation-menu':
        return renderNavigationMenu();
      case 'drawer':
        return renderDrawer();
      case 'alert-dialog':
        return renderAlertDialog();
      case 'collapsible':
        return renderCollapsible();
      case 'hover-card':
        return renderHoverCard();
      case 'toggle':
        return renderToggle();
      case 'separator':
        return renderSeparator();
      case 'aspect-ratio':
        return renderAspectRatio();
      case 'input-otp':
        return renderInputOTP();
      case 'carousel':
        return renderCarousel();
      case 'combobox':
        return renderCombobox();
      case 'menubar':
        return renderMenubar();
      case 'sidebar':
        return renderSidebar();
      case 'resizable':
        return renderResizable();
      default:
        return <div>Select a component from the sidebar</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/dashboard" style={{ color: '#6B7280' }}>
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Nuvi Design System</h1>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Complete component library inspired by Shadcn/UI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #E5E7EB', padding: '24px', overflowY: 'auto' }}>
          {/* Data Display */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Data Display
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['accordion', 'alert', 'avatar', 'badge', 'card', 'table'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Forms */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Forms
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['button', 'checkbox', 'input', 'radio', 'select', 'switch', 'textarea'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Feedback */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Feedback
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['progress', 'skeleton', 'spinner', 'toast'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Navigation */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Navigation
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['breadcrumb', 'dropdown', 'navigation-menu', 'pagination', 'tabs'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {/* Overlays */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Overlays
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['dialog', 'alert-dialog', 'drawer', 'popover', 'sheet', 'tooltip', 'hover-card', 'context-menu'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Layout */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Layout
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['aspect-ratio', 'collapsible', 'resizable', 'separator', 'sidebar', 'toggle'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {/* Advanced */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Advanced
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {['command-palette', 'date-picker', 'slider', 'scroll-area', 'carousel', 'combobox', 'input-otp', 'menubar'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item ? 'rgba(139, 159, 126, 0.1)' : 'transparent',
                    color: activeTab === item ? '#8B9F7E' : '#2B2B2B',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
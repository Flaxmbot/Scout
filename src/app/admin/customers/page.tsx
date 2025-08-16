"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Mail, Eye, ShoppingBag, Calendar, DollarSign, Users, TrendingUp, Phone, MapPin, Tag, MessageSquare, Plus, X, FileText, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  segment: 'VIP' | 'Loyal' | 'Active' | 'New';
  avatar?: string;
  notes?: string;
  tags?: string[];
}

interface Order {
  id: string;
  date: string;
  amount: number;
  status: string;
  items: number;
}

interface Communication {
  id: string;
  type: 'email' | 'phone' | 'note';
  date: string;
  subject: string;
  content: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        registrationDate: '2023-01-15',
        totalOrders: 8,
        totalSpent: 1250.00,
        lastOrderDate: '2024-01-10',
        segment: 'VIP',
        tags: ['premium', 'frequent-buyer']
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 987-6543',
        registrationDate: '2023-03-22',
        totalOrders: 4,
        totalSpent: 320.00,
        lastOrderDate: '2024-01-05',
        segment: 'Loyal',
        tags: ['loyal']
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        registrationDate: '2023-11-10',
        totalOrders: 2,
        totalSpent: 89.99,
        lastOrderDate: '2023-12-15',
        segment: 'Active'
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        registrationDate: '2024-01-08',
        totalOrders: 0,
        totalSpent: 0,
        segment: 'New'
      }
    ];

    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (customer.phone && customer.phone.includes(searchTerm));
      
      const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
      
      return matchesSearch && matchesSegment;
    });

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'registrationDate':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'lastOrder':
          const aDate = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          const bDate = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedSegment, sortBy]);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Loyal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'New': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Mock order data
    setCustomerOrders([
      { id: '1', date: '2024-01-10', amount: 89.99, status: 'Delivered', items: 3 },
      { id: '2', date: '2023-12-15', amount: 156.50, status: 'Delivered', items: 2 }
    ]);
    // Mock communication data
    setCommunications([
      { id: '1', type: 'email', date: '2024-01-05', subject: 'Welcome Back!', content: 'Thank you for your recent order...' },
      { id: '2', type: 'note', date: '2023-12-20', subject: 'Customer Feedback', content: 'Customer expressed satisfaction with product quality.' }
    ]);
    setIsProfileOpen(true);
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedCustomer) {
      const note: Communication = {
        id: Date.now().toString(),
        type: 'note',
        date: new Date().toISOString().split('T')[0],
        subject: 'Note',
        content: newNote
      };
      setCommunications([note, ...communications]);
      setNewNote('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && selectedCustomer) {
      const updatedCustomer = {
        ...selectedCustomer,
        tags: [...(selectedCustomer.tags || []), newTag.trim()]
      };
      setSelectedCustomer(updatedCustomer);
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setNewTag('');
    }
  };

  const customerStats = {
    total: customers.length,
    vip: customers.filter(c => c.segment === 'VIP').length,
    loyal: customers.filter(c => c.segment === 'Loyal').length,
    active: customers.filter(c => c.segment === 'Active').length,
    new: customers.filter(c => c.segment === 'New').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and insights</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Customers</p>
                <p className="text-2xl font-bold text-blue-900">{customerStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">VIP Customers</p>
                <p className="text-2xl font-bold text-purple-900">{customerStats.vip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Loyal</p>
                <p className="text-2xl font-bold text-blue-900">{customerStats.loyal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{customerStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Loyal">Loyal</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="registrationDate">Registration Date</SelectItem>
                <SelectItem value="totalSpent">Total Spent</SelectItem>
                <SelectItem value="lastOrder">Last Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            Showing {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Segment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.registrationDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 font-medium">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {customer.lastOrderDate ? 
                          new Date(customer.lastOrderDate).toLocaleDateString() : 
                          'No orders'
                        }
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getSegmentColor(customer.segment)}>
                        {customer.segment}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedCustomer?.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {selectedCustomer ? getInitials(selectedCustomer.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">{selectedCustomer?.name}</div>
                <div className="text-sm text-gray-500">{selectedCustomer?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh]">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedCustomer?.email}</span>
                      </div>
                      {selectedCustomer?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {selectedCustomer?.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCustomer.address}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          Registered {selectedCustomer && new Date(selectedCustomer.registrationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="font-medium">{selectedCustomer?.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent:</span>
                        <span className="font-medium">${selectedCustomer?.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Segment:</span>
                        <Badge className={selectedCustomer ? getSegmentColor(selectedCustomer.segment) : ''}>
                          {selectedCustomer?.segment}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Order:</span>
                        <span className="font-medium">
                          {selectedCustomer?.lastOrderDate ? 
                            new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 
                            'No orders'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">Order #{order.id}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()} • {order.items} items
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${order.amount.toFixed(2)}</div>
                            <Badge variant="outline" className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Communication History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {communications.map((comm) => (
                        <div key={comm.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {comm.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                              {comm.type === 'phone' && <Phone className="w-4 h-4 text-green-500" />}
                              {comm.type === 'note' && <MessageSquare className="w-4 h-4 text-gray-500" />}
                              <span className="font-medium">{comm.subject}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(comm.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add Note</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        placeholder="Add a note about this customer..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <Button onClick={handleAddNote} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer?.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          size="sm"
                        />
                        <Button onClick={handleAddTag} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export const FLUTTER_MAIN_DART_CODE = `// ==========================================
// আমাদের মেস (Amader Mess) - Flutter Mobile App
// 100% Offline with Hive local database persistence
// Color Palette: Deep Orange & Navy Blue (Material 3)
// ==========================================

import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';

// --- HIVE DATA MODELS ---

class Member {
  final String id;
  final String name;
  final String phone;
  final String room;
  final String joinDate;

  Member({
    required this.id,
    required this.name,
    required this.phone,
    this.room = '',
    required this.joinDate,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'phone': phone,
    'room': room,
    'joinDate': joinDate,
  };

  factory Member.fromMap(Map<dynamic, dynamic> map) => Member(
    id: map['id'] ?? '',
    name: map['name'] ?? '',
    phone: map['phone'] ?? '',
    room: map['room'] ?? '',
    joinDate: map['joinDate'] ?? '',
  );
}

class MealEntry {
  final String id;
  final String memberId;
  final String date;
  final double breakfast;
  final double lunch;
  final double dinner;
  final double guestMeals;

  MealEntry({
    required this.id,
    required this.memberId,
    required this.date,
    this.breakfast = 0,
    this.lunch = 0,
    this.dinner = 0,
    this.guestMeals = 0,
  });

  double get total => breakfast + lunch + dinner + guestMeals;

  Map<String, dynamic> toMap() => {
    'id': id,
    'memberId': memberId,
    'date': date,
    'breakfast': breakfast,
    'lunch': lunch,
    'dinner': dinner,
    'guestMeals': guestMeals,
  };

  factory MealEntry.fromMap(Map<dynamic, dynamic> map) => MealEntry(
    id: map['id'] ?? '',
    memberId: map['memberId'] ?? '',
    date: map['date'] ?? '',
    breakfast: (map['breakfast'] as num?)?.toDouble() ?? 0.0,
    lunch: (map['lunch'] as num?)?.toDouble() ?? 0.0,
    dinner: (map['dinner'] as num?)?.toDouble() ?? 0.0,
    guestMeals: (map['guestMeals'] as num?)?.toDouble() ?? 0.0,
  );
}

class MarketExpense {
  final String id;
  final String memberId;
  final double amount;
  final String date;
  final String items;

  MarketExpense({
    required this.id,
    required this.memberId,
    required this.amount,
    required this.date,
    required this.items,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'memberId': memberId,
    'amount': amount,
    'date': date,
    'items': items,
  };

  factory MarketExpense.fromMap(Map<dynamic, dynamic> map) => MarketExpense(
    id: map['id'] ?? '',
    memberId: map['memberId'] ?? '',
    amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
    date: map['date'] ?? '',
    items: map['items'] ?? '',
  );
}

class UtilityBill {
  final String id;
  final String title;
  final double amount;
  final String month;
  final bool isPaid;

  UtilityBill({
    required this.id,
    required this.title,
    required this.amount,
    required this.month,
    this.isPaid = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'amount': amount,
    'month': month,
    'isPaid': isPaid,
  };

  factory UtilityBill.fromMap(Map<dynamic, dynamic> map) => UtilityBill(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
    month: map['month'] ?? '',
    isPaid: map['isPaid'] ?? false,
  );
}

class Deposit {
  final String id;
  final String memberId;
  final double amount;
  final String date;
  final String note;

  Deposit({
    required this.id,
    required this.memberId,
    required this.amount,
    required this.date,
    this.note = '',
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'memberId': memberId,
    'amount': amount,
    'date': date,
    'note': note,
  };

  factory Deposit.fromMap(Map<dynamic, dynamic> map) => Deposit(
    id: map['id'] ?? '',
    memberId: map['memberId'] ?? '',
    amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
    date: map['date'] ?? '',
    note: map['note'] ?? '',
  );
}

// --- MAIN ENTRY POINT WITH HIVE INITIALIZATION ---

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local offline persistent storage
  await Hive.initFlutter();
  
  // Open Hive Boxes for each data collection
  await Hive.openBox('membersBox');
  await Hive.openBox('mealsBox');
  await Hive.openBox('expensesBox');
  await Hive.openBox('utilitiesBox');
  await Hive.openBox('depositsBox');

  // Seed default data if empty on first run
  final membersBox = Hive.box('membersBox');
  if (membersBox.isEmpty) {
    final defaultMembers = [
      Member(id: '1', name: 'রাকিবুল ইসলাম', phone: '01711223344', room: 'রুম ২০২', joinDate: '2026-09-01'),
      Member(id: '2', name: 'তানভীর আহমেদ', phone: '01822334455', room: 'রুম ২০২', joinDate: '2026-09-01'),
      Member(id: '3', name: 'সাব্বির হোসেন', phone: '01933445566', room: 'রুম ২০৩', joinDate: '2026-09-01'),
      Member(id: '4', name: 'আরিফুর রহমান', phone: '01544556677', room: 'রুম ২০৩', joinDate: '2026-09-01'),
    ];
    for (var m in defaultMembers) {
      membersBox.put(m.id, m.toMap());
    }
  }

  runApp(const AmaderMessApp());
}

class AmaderMessApp extends StatelessWidget {
  const AmaderMessApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'আমাদের মেস',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE64A19), // Deep Orange
          primary: const Color(0xFFE64A19),
          secondary: const Color(0xFF0F172A), // Navy Blue
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Colors.white,
          elevation: 2,
        ),
      ),
      home: const MessHomeScreen(),
    );
  }
}

class MessHomeScreen extends StatefulWidget {
  const MessHomeScreen({Key? key}) : super(key: key);

  @override
  State<MessHomeScreen> createState() => _MessHomeScreenState();
}

class _MessHomeScreenState extends State<MessHomeScreen> {
  int _currentIndex = 0;
  String currentMonth = '2026-09';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('আমাদের মেস', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'রিপোর্ট শেয়ার করুন',
            onPressed: () {
              // Share report logic
            },
          ),
        ],
      ),
      body: _buildCurrentTab(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'ড্যাশবোর্ড'),
          NavigationDestination(icon: Icon(Icons.restaurant_outlined), selectedIcon: Icon(Icons.restaurant), label: 'মিল এন্ট্রি'),
          NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), selectedIcon: Icon(Icons.shopping_cart), label: 'বাজার ও বিল'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'ব্যালেন্স শিট'),
          NavigationDestination(icon: Icon(Icons.people_outlined), selectedIcon: Icon(Icons.people), label: 'মেম্বার'),
        ],
      ),
    );
  }

  Widget _buildCurrentTab() {
    switch (_currentIndex) {
      case 0:
        return _buildDashboard();
      case 1:
        return _buildMealCounter();
      case 2:
        return _buildMarketAndUtilities();
      case 3:
        return _buildBalanceSheet();
      case 4:
        return _buildMembersList();
      default:
        return _buildDashboard();
    }
  }

  Widget _buildDashboard() {
    return ValueListenableBuilder(
      valueListenable: Hive.box('expensesBox').listenable(),
      builder: (context, Box expBox, _) {
        return ValueListenableBuilder(
          valueListenable: Hive.box('mealsBox').listenable(),
          builder: (context, Box mealsBox, _) {
            // Calculate totals
            double totalBazar = 0;
            for (var val in expBox.values) {
              totalBazar += (val['amount'] as num?)?.toDouble() ?? 0;
            }
            double totalMeals = 0;
            for (var val in mealsBox.values) {
              totalMeals += ((val['breakfast'] ?? 0) + (val['lunch'] ?? 0) + (val['dinner'] ?? 0) + (val['guestMeals'] ?? 0));
            }
            double mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    color: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          const Text('বর্তমান মিল রেট', style: TextStyle(color: Colors.white70, fontSize: 16)),
                          const SizedBox(height: 8),
                          Text('৳ \${mealRate.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFFFF7043), fontSize: 36, fontWeight: FontWeight.bold)),
                          const Divider(color: Colors.white24, height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Column(
                                children: [
                                  const Text('মোট বাজার খরচ', style: TextStyle(color: Colors.white70, fontSize: 13)),
                                  const SizedBox(height: 4),
                                  Text('৳ \${totalBazar.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Column(
                                children: [
                                  const Text('মোট মিল সংখ্যা', style: TextStyle(color: Colors.white70, fontSize: 13)),
                                  const SizedBox(height: 4),
                                  Text('\${totalMeals.toStringAsFixed(1)} টি', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('দ্রুত অ্যাকশন', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => setState(() => _currentIndex = 1),
                          icon: const Icon(Icons.add),
                          label: const Text('মিল এন্ট্রি'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE64A19),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => setState(() => _currentIndex = 2),
                          icon: const Icon(Icons.shopping_cart),
                          label: const Text('বাজার খরচ'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E293B),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMealCounter() {
    return const Center(child: Text('প্রতিদিনের মিল কাউন্টার (সকাল, দুপুর, রাত, মেহমান মিল)'));
  }

  Widget _buildMarketAndUtilities() {
    return const Center(child: Text('দৈনিক বাজার ও শেয়ার্ড ইউটিলিটি বিল'));
  }

  Widget _buildBalanceSheet() {
    return const Center(child: Text('মেম্বার ডিপোজিট ও ব্যালেন্স শিট'));
  }

  Widget _buildMembersList() {
    return const Center(child: Text('মেস মেম্বারদের তালিকা ও ব্যবস্থাপনা'));
  }
}
`;

export const FLUTTER_PUBSPEC_YAML = `name: amader_mess
description: Offline-first Mess & Meal Management app for bachelor students in Flutter.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  intl: ^0.19.0
  path_provider: ^2.1.2
  share_plus: ^9.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;

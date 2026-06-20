#include <cstddef>
#include <iomanip>
#include <iostream>
#include <memory>
#include <string_view>
#include <type_traits>
#include <utility>

#if __cplusplus < 202002L
#error "This example requires C++20 or later."
#endif

struct EmptyPolicy {};
struct AllocatorPolicy {};
struct LoggingPolicy {};

struct StatefulPolicy {
    int id = 0;
};

struct OrdinaryMember {
    EmptyPolicy policy;
    int value = 0;
};

struct InheritanceEBO : private EmptyPolicy {
    int value = 0;

    EmptyPolicy& policy() noexcept { return *this; }
    const EmptyPolicy& policy() const noexcept { return *this; }
};

struct NoUniqueAddressMember {
    [[no_unique_address]] EmptyPolicy policy;
    int value = 0;
};

struct TwoDifferentEmptyMembers {
    [[no_unique_address]] AllocatorPolicy allocator;
    [[no_unique_address]] LoggingPolicy logger;
    int value = 0;
};

struct TwoSameEmptyMembers {
    [[no_unique_address]] EmptyPolicy first;
    [[no_unique_address]] EmptyPolicy second;
    int value = 0;
};

struct StatefulMember {
    [[no_unique_address]] StatefulPolicy policy;
    int value = 0;
};

template<class Policy>
class PolicyBox {
public:
    constexpr explicit PolicyBox(Policy policy = {})
        noexcept(std::is_nothrow_move_constructible_v<Policy>)
        : policy_(std::move(policy)) {}

    constexpr Policy& policy() noexcept { return policy_; }
    constexpr const Policy& policy() const noexcept { return policy_; }

    constexpr int& value() noexcept { return value_; }
    constexpr const int& value() const noexcept { return value_; }

private:
    [[no_unique_address]] Policy policy_;
    int value_ = 0;
};

static_assert(std::is_empty_v<EmptyPolicy>);
static_assert(!std::is_empty_v<StatefulPolicy>);
static_assert(sizeof(EmptyPolicy) >= 1);

template<class T>
void print_layout(std::string_view name) {
    std::cout << std::left << std::setw(34) << name
              << " sizeof=" << std::setw(3) << sizeof(T)
              << " alignof=" << std::setw(3) << alignof(T)
              << " empty=" << std::boolalpha << std::is_empty_v<T> << '\n';
}

int main() {
    std::cout << "C++ version (__cplusplus): " << __cplusplus << "\n\n";

    print_layout<EmptyPolicy>("EmptyPolicy");
    print_layout<OrdinaryMember>("OrdinaryMember");
    print_layout<InheritanceEBO>("InheritanceEBO");
    print_layout<NoUniqueAddressMember>("NoUniqueAddressMember");
    print_layout<TwoDifferentEmptyMembers>("TwoDifferentEmptyMembers");
    print_layout<TwoSameEmptyMembers>("TwoSameEmptyMembers");
    print_layout<StatefulMember>("StatefulMember");
    print_layout<PolicyBox<EmptyPolicy>>("PolicyBox<EmptyPolicy>");
    print_layout<PolicyBox<StatefulPolicy>>("PolicyBox<StatefulPolicy>");

    PolicyBox<StatefulPolicy> box{StatefulPolicy{7}};
    box.value() = 200;

    TwoSameEmptyMembers same;
    const bool state_preserved = box.value() == 200 && box.policy().id == 7;
    const bool addresses_differ =
        std::addressof(same.first) != std::addressof(same.second);

    std::cout << "\nstateful policy preserved: " << state_preserved << '\n';
    std::cout << "same-type addresses differ: " << addresses_differ << '\n';

    if (!state_preserved || !addresses_differ) {
        std::cerr << "behavior tests: FAILED\n";
        return 1;
    }

    std::cout << "behavior tests: PASSED\n";
    return 0;
}
